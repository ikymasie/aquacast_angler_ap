
'use server';

import type { Species, HourPoint, DayContext, RecentWindow, ScoredHour, DaypartName, DaypartScore, ScoreStatus, OverallDayScore } from './types';
import { parseISO, isWithinInterval, addMinutes, subMinutes, format, getHours, getMinutes, differenceInMinutes, addHours } from 'date-fns';
import speciesRules from './species-rules.json';

type SpeciesKey = keyof typeof speciesRules;

// --- Curve Functions ---

function gaussian(x: number, mu: number, sigma: number, maxScore: number = 100): number {
  if (sigma === 0) return x === mu ? maxScore : 0;
  return maxScore * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}

function piecewiseLinear(x: number, pointsX: number[], pointsY: number[]): number {
  if (x <= pointsX[0]) return pointsY[0];
  if (x >= pointsX[pointsX.length - 1]) return pointsY[pointsY.length - 1];

  for (let i = 0; i < pointsX.length - 1; i++) {
    if (x >= pointsX[i] && x <= pointsX[i + 1]) {
      const t = (x - pointsX[i]) / (pointsX[i + 1] - pointsX[i]);
      return pointsY[i] * (1 - t) + pointsY[i + 1] * t;
    }
  }
  return 75; // Should not be reached
}

function bucketPenalty(value: number, breaks: number[], scores: number[]): number {
    for (let i = 1; i < breaks.length; i++) {
        if (value < breaks[i]) {
            return scores[i];
        }
    }
    return scores[scores.length - 1];
}

function step(value: number, mm: number[], scores: number[]): number {
  for (let i = 0; i < mm.length; i++) {
    if (value <= mm[i]) {
      return scores[i];
    }
  }
  return scores[scores.length - 1];
}

function twilightBoost(t: string, ctx: DayContext, params: any): number {
  const time = parseISO(t);
  const sunrise = parseISO(ctx.sunrise);
  const sunset = parseISO(ctx.sunset);

  const dawnStart = addMinutes(sunrise, params.dawn_window_min);
  const dawnEnd = addMinutes(sunrise, params.dawn_window_max);
  const duskStart = addMinutes(sunset, params.dusk_window_min);
  const duskEnd = addMinutes(sunset, params.dusk_window_max);

  if (isWithinInterval(time, { start: dawnStart, end: dawnEnd })) return 90;
  if (isWithinInterval(time, { start: duskStart, end: duskEnd })) return 85;

  const hour = getHours(time);
  if (hour < getHours(dawnStart) || hour > getHours(duskEnd)) return params.night_penalty;
  
  return params.midday_penalty;
}

function phaseBonus(value: number, bonuses: {phase: string, score: number}[]): number {
    // A simple mapping for now. A more complex implementation could be added.
    if (value > 0.95 || value < 0.05) { // full or new
        const bonus = bonuses.find(b => b.phase === 'new' || b.phase === 'full');
        return bonus ? bonus.score : 75;
    } else if (value > 0.45 && value < 0.55) { // quarter
        const bonus = bonuses.find(b => b.phase === 'quarter');
        return bonus ? bonus.score : 75;
    }
    return 75;
}

function inverseStd(value: number, breaks: number[], scores: number[]): number {
  return bucketPenalty(value, breaks, scores);
}

const curveFunctions: Record<string, Function> = {
  gaussian,
  piecewise_linear: piecewiseLinear,
  bucket_penalty: bucketPenalty,
  step,
  twilight_boost: twilightBoost,
  phase_bonus: phaseBonus,
  inverse_std: inverseStd,
};

// --- Main Scoring Flow ---

export async function scoreHour(species: Species, h: HourPoint, ctx: DayContext, recent: RecentWindow): Promise<number> {
  const speciesKey = species.toLowerCase() as SpeciesKey;
  if (!speciesRules[speciesKey]) {
      throw new Error(`Invalid species key: ${speciesKey}`);
  }
  const cfg = speciesRules[speciesKey];

  const subScores: Record<string, number> = {};

  for (const [key, curveParams] of Object.entries(cfg.curves as any)) {
    const { type, params, uses, missing_score } = curveParams as any;
    let value: any;
    const inputKey = (uses as string[])[0];

    // Map the hour point data to the correct key for the curve function
    switch (inputKey) {
        case 'water_temp_c': value = recent.waterTempC; break;
        case 'air_temp_c': value = h.tempC; break;
        case 'wind_speed_kph': value = h.windKph; break;
        case 'pressure_trend_hpa_per_3h': value = h.derived.pressureTrend3h; break;
        case 'cloud_cover_pct': value = h.cloudPct; break;
        case 'time_ts': value = h.t; break;
        case 'precip_mm_per_h': value = h.precipMm; break;
        case 'moon_phase_0_new_05_full': value = ctx.moonPhase; break;
        case 'stability_index': value = recent.stdTempPressure; break;
        default: value = null;
    }
    
    if (value === null || value === undefined) {
        subScores[key] = missing_score ?? 72; // Use missing score or default
        continue;
    }

    const curveFunc = curveFunctions[type];
    if (curveFunc) {
      if (type === 'twilight_boost') {
          subScores[key] = curveFunc(value, ctx, params);
      } else if (type === 'piecewise_linear') {
          subScores[key] = curveFunc(value, params.x, params.y);
      } else if (type === 'bucket_penalty') {
          subScores[key] = curveFunc(value, params.breaks_kph, params.scores);
      } else if (type === 'step') {
          subScores[key] = curveFunc(value, params.mm_per_h, params.scores);
      } else if (type === 'gaussian') {
          subScores[key] = curveFunc(value, params.mu, params.sigma, params.max_score);
      } else if (type === 'phase_bonus') {
           subScores[key] = curveFunc(value, params.bonuses);
      } else if (type === 'inverse_std') {
           subScores[key] = curveFunc(value, params.std_breaks, params.scores);
      } else {
        subScores[key] = 75;
      }
    } else {
      subScores[key] = 75; // Default for unknown types
    }
  }

  // Add placeholder for factors not calculated in this simplified loop
   if (cfg.weights.level_flow && !subScores.level_flow) {
    subScores.level_flow = 75;
  }
  if (cfg.weights.light_level && !subScores.light_level) {
    subScores.light_level = 75;
  }
  
  const totalWeight = Object.values(cfg.weights).reduce((sum, w) => sum + (w as number), 0);

  const total = Object.entries(cfg.weights)
    .reduce((acc, [key, w]) => {
        const weight = w as number;
        const score = subScores[key] ?? 75; // Default score if not calculated
        // Normalize weight
        return acc + (weight / totalWeight) * score;
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
        const isoTime = scores[i].time; // use original unsmoothed time
        if (score >= threshold) {
            if (!currentRun) {
                currentRun = { start: isoTime, end: isoTime, scores: [score] };
            } else {
                currentRun.end = isoTime;
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


// --- Daypart Scoring ---

function getScoreStatus(score: number): ScoreStatus {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
}

function findBestSubWindow(hours: ScoredHour[]): { start: string; end: string, status: ScoreStatus } | null {
    if (!hours || hours.length === 0) return null;
    
    const goodHours = hours.filter(h => h.score >= 60);
    if (goodHours.length === 0) return null;

    let bestRun: ScoredHour[] = [];
    let currentRun: ScoredHour[] = [];

    for (let i = 0; i < goodHours.length; i++) {
        if (i === 0 || differenceInMinutes(parseISO(goodHours[i].time), parseISO(goodHours[i - 1].time)) <= 61) { // Allow 61 min for rounding
            currentRun.push(goodHours[i]);
        } else {
            if (currentRun.length > bestRun.length) {
                bestRun = currentRun;
            }
            currentRun = [goodHours[i]];
        }
    }
    if (currentRun.length > bestRun.length) {
        bestRun = currentRun;
    }

    if (bestRun.length === 0 || differenceInMinutes(parseISO(bestRun[bestRun.length - 1].time), parseISO(bestRun[0].time)) < 45) {
        return null;
    }
    
    const avgScore = bestRun.reduce((sum, h) => sum + h.score, 0) / bestRun.length;

    return {
        start: bestRun[0].time,
        end: bestRun[bestRun.length - 1].time,
        status: getScoreStatus(avgScore),
    };
}


export async function calculateDaypartScores(
    hourlyScores: ScoredHour[],
    sunriseISO: string,
    sunsetISO: string
): Promise<DaypartScore[]> {
    const sunrise = parseISO(sunriseISO);
    const sunset = parseISO(sunsetISO);
    const solarNoon = new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2);
    const now = new Date();

    const dayparts: Record<DaypartName, { start: Date; end: Date }> = {
        Morning: { start: subMinutes(sunrise, 60), end: addMinutes(sunrise, 180) },
        Midday: { start: addMinutes(sunrise, 180), end: subMinutes(solarNoon, 60) },
        Afternoon: { start: subMinutes(solarNoon, 60), end: subMinutes(sunset, 120) },
        Evening: { start: subMinutes(sunset, 90), end: addMinutes(sunset, 60) },
        Night: { start: addMinutes(sunset, 60), end: subMinutes(addHours(sunrise, 24), 60) } 
    };
    
    const results: DaypartScore[] = [];

    (Object.keys(dayparts) as DaypartName[]).forEach(partName => {
        const { start, end } = dayparts[partName];
        
        const scoresInPart = hourlyScores.filter(h => {
             const hTime = parseISO(h.time);
             return isWithinInterval(hTime, {start, end});
        });

        if (scoresInPart.length === 0) {
             results.push({ name: partName, score: 0, status: "Poor", hasWindow: false, isCurrent: false });
             return;
        }

        const sortedScores = [...scoresInPart].sort((a, b) => b.score - a.score);
        const top60PercentCount = Math.max(2, Math.ceil(sortedScores.length * 0.6));
        const topScores = sortedScores.slice(0, top60PercentCount);
        
        const avgScore = Math.round(topScores.reduce((sum, h) => sum + h.score, 0) / topScores.length);
        const status = getScoreStatus(avgScore);
        const bestWindow = findBestSubWindow(scoresInPart);
        
        const isCurrent = isWithinInterval(now, { start, end });

        results.push({
            name: partName,
            score: avgScore,
            status,
            hasWindow: !!bestWindow,
            isCurrent,
        });
    });

    return results;
}

export async function getOverallDayScore(daypartScores: DaypartScore[], hourlyScores: ScoredHour[]): Promise<OverallDayScore> {
    if (!daypartScores || daypartScores.length === 0) {
        return {
            dayAvgScore: 0,
            dayStatus: "Poor",
            bestWindow: null
        };
    }
    
    const dayAvgScore = Math.round(daypartScores.reduce((sum, part) => sum + part.score, 0) / daypartScores.length);
    const dayStatus = getScoreStatus(dayAvgScore);
    
    const bestWindow = findBestSubWindow(hourlyScores);

    return { dayAvgScore, dayStatus, bestWindow };
}
