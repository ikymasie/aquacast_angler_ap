'use server';

import type { Species, HourPoint, DayContext, RecentWindow, ScoredHour } from './types';
import { parseISO, isWithinInterval, addMinutes, subMinutes, format } from 'date-fns';
import speciesRules from './species-rules.json';

type SpeciesKey = keyof typeof speciesRules;

// --- Curve Functions ---

function gauss(x: number, mu: number, sigma: number): number {
  if (sigma === 0) return x === mu ? 100 : 0;
  return 100 * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}

function penalty(value: number, breaks: number[], scores: number[]): number {
  for (let i = 0; i < breaks.length; i++) {
    if (value < breaks[i]) {
      return scores[i];
    }
  }
  return scores[scores.length - 1];
}

function plateau(value: number, ranges: number[][], score: number): number {
  for (const range of ranges) {
    if (value >= range[0] && value <= range[1]) {
      return score;
    }
  }
  return 100 - score; // Simplified penalty outside range
}

function trend(value: number, riseBonus: number = 0, fallPenalty: number = 0, preFrontDropBonus: number = 0): number {
  let score = 75; // baseline
  if (value > 0.5) score += riseBonus;
  if (value < -0.5 && value > -2.0) score += preFrontDropBonus;
  if (value < -2.0) score += fallPenalty;
  return Math.max(0, Math.min(100, score));
}

function twilightBoost(t: string, dawn: number, dusk: number, ctx: DayContext): number {
  const time = parseISO(t);
  const sunrise = parseISO(ctx.sunrise);
  const sunset = parseISO(ctx.sunset);

  const dawnWindow = { start: subMinutes(sunrise, 60), end: addMinutes(sunrise, 90) };
  const duskWindow = { start: subMinutes(sunset, 90), end: addMinutes(sunset, 60) };

  if (isWithinInterval(time, dawnWindow)) return 80 + dawn;
  if (isWithinInterval(time, duskWindow)) return 80 + dusk;
  return 50; // Midday baseline
}

function step(value: number, mm: number[], scores: number[]): number {
  for (let i = 0; i < mm.length; i++) {
    if (value <= mm[i]) {
      return scores[i];
    }
  }
  return scores[scores.length - 1];
}

function phase(value: number, full: number, newMoon: number, q1q3: number): number {
    let score = 75; // baseline
    if (value > 0.95 || value < 0.05) score += full; // full or new
    else if (value > 0.2 && value < 0.3) score += q1q3; // q1
    else if (value > 0.7 && value < 0.8) score += q1q3; // q3
    return Math.max(0, Math.min(100, score));
}

function inverseVar(value: number, stdBreaks: number[], scores: number[]): number {
  return penalty(value, stdBreaks, scores);
}

const curveFunctions = {
  gauss,
  penalty,
  plateau,
  trend,
  twilightBoost,
  step,
  phase,
  inverseVar,
};

// --- Main Scoring Flow ---

export async function scoreHour(species: Species, h: HourPoint, ctx: DayContext, recent: RecentWindow): Promise<number> {
  const speciesKey = species.toLowerCase() as SpeciesKey;
  if (!speciesRules[speciesKey]) {
      throw new Error(`Invalid species key: ${speciesKey}`);
  }
  const cfg = speciesRules[speciesKey];

  const subScores: Record<string, number> = {};

  for (const [key, curveParams] of Object.entries(cfg.curves)) {
    const { type, ...params } = curveParams as any;
    let value: number | string | DayContext;

    // Map the hour point data to the correct key for the curve function
    switch (key) {
        case 'waterTempComfort': value = recent.waterTempC; break;
        case 'airTempComfort': value = h.tempC; break;
        case 'wind': value = h.windKph; break;
        case 'cloud': value = h.cloudPct; break;
        case 'pressureTrend': value = h.derived.pressureTrend3h; break;
        case 'timeOfDay': value = h.t; break;
        case 'precip': value = h.precipMm; break;
        case 'moon': value = ctx.moonPhase; break;
        case 'stability': value = recent.stdTempPressure; break;
        default: value = 75; continue; // Skip unknown keys
    }
    
    // Call the appropriate curve function based on its type
    if (type === 'twilightBoost') {
        subScores[key] = curveFunctions[type](value as string, params.dawn, params.dusk, ctx);
    } else if (type === 'trend') {
        subScores[key] = curveFunctions[type](value as number, params.riseBonus, params.fallPenalty, params.preFrontDropBonus);
    } else if (type === 'phase') {
        subScores[key] = curveFunctions[type](value as number, params.full, params.new, params.q1q3);
    } else if (type === 'gauss') {
        subScores[key] = curveFunctions[type](value as number, params.mu, params.sigma);
    } else if (type === 'penalty' || type === 'inverseVar') {
        subScores[key] = curveFunctions[type](value as number, params.breaks, params.scores);
    } else if (type === 'plateau') {
        subScores[key] = curveFunctions[type](value as number, params.ranges, params.score);
    } else if (type === 'step') {
        subScores[key] = curveFunctions[type](value as number, params.mm, params.scores);
    } else {
        subScores[key] = 75; // Default for unknown types
    }
  }

  // Add placeholder for levelFlow if it's in weights but not curves
  if (cfg.weights.levelFlow && !subScores.levelFlow) {
    subScores.levelFlow = 75;
  }
  
  const total = Object.entries(cfg.weights)
    .reduce((acc, [key, w]) => {
        const weight = w as number;
        const score = subScores[key] ?? 75; // Default score if not calculated
        return acc + weight * score;
    }, 0);

  return Math.max(0, Math.min(100, Math.round(total)));
}

export async function recommendWindows(scores: ScoredHour[], threshold: number = 60): Promise<string> {
    if (!scores || scores.length === 0) return "Not enough data.";

    const smoothedScores = scores.map((val, i) => {
        if (i > 0 && i < scores.length - 1) {
            return { t: val.time, score: (scores[i - 1].score + val.score + scores[i + 1].score) / 3 };
        }
        return { t: val.time, score: val.score };
    });

    const goodRuns: { start: string; end: string; scores: number[] }[] = [];
    let currentRun: { start: string; end: string; scores: number[] } | null = null;

    smoothedScores.forEach(({ time, score }, i) => {
        if (score >= threshold) {
            if (!currentRun) {
                currentRun = { start: time, end: time, scores: [score] };
            } else {
                currentRun.end = time;
                currentRun.scores.push(score);
            }
        } else {
            if (currentRun) {
                goodRuns.push(currentRun);
                currentRun = null;
            }
        }
    });
    if (currentRun) goodRuns.push(currentRun);

    if (goodRuns.length === 0) {
        const bestHour = scores.reduce((prev, current) => (prev.score > current.score) ? prev : current);
        return `Best chance around ${format(parseISO(bestHour.time), 'p')}, though conditions aren't ideal.`;
    }

    const mergedRuns = goodRuns.reduce((acc, run) => {
        const lastRun = acc[acc.length - 1];
        if (lastRun) {
            const lastEnd = parseISO(lastRun.end);
            const currentStart = parseISO(run.start);
            // Merge if gap is 1 hour or less
            if ((currentStart.getTime() - lastEnd.getTime()) / (1000 * 60 * 60) <= 1) {
                lastRun.end = run.end;
                lastRun.scores.push(...run.scores);
                return acc;
            }
        }
        acc.push(run);
        return acc;
    }, [] as typeof goodRuns);
    
    const topRuns = mergedRuns
      .map(run => ({ ...run, avgScore: run.scores.reduce((a, b) => a + b, 0) / run.scores.length }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 2);

    return topRuns.map(run => `${format(parseISO(run.start), 'p')} - ${format(parseISO(run.end), 'p')}`).join(" & ");
}