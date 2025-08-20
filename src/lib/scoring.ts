
'use server';

import type { Species, HourPoint, DayContext, RecentWindow, ScoredHour, DaypartName, DaypartScore, ScoreStatus, OverallDayScore, RecommendedWindow } from './types';
import { parseISO, isWithinInterval, addMinutes, subMinutes, format, getHours, getMinutes, differenceInMinutes, addHours, differenceInHours } from 'date-fns';
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

export async function recommendWindows(scores: ScoredHour[], threshold: number = 60, preferredDuration: number = 4, maxDuration: number = 8): Promise<RecommendedWindow | null> {
    if (!scores || scores.length < preferredDuration) return null;

    let bestWindow: ScoredHour[] | null = null;
    let maxAvgScore = -1;

    // 1. Find the best continuous 4-hour window
    for (let i = 0; i <= scores.length - preferredDuration; i++) {
        const window = scores.slice(i, i + preferredDuration);
        const avgScore = window.reduce((sum, h) => sum + h.score, 0) / preferredDuration;
        if (avgScore > maxAvgScore) {
            maxAvgScore = avgScore;
            bestWindow = window;
        }
    }

    if (!bestWindow || maxAvgScore < threshold) {
        // Fallback if no window meets the average threshold
        return null;
    }

    // 2. Expand this window outwards up to 8 hours, as long as scores are above threshold
    let startIndex = scores.indexOf(bestWindow[0]);
    let endIndex = scores.indexOf(bestWindow[bestWindow.length - 1]);

    // Expand backwards
    let currentStartIndex = startIndex;
    while (currentStartIndex > 0) {
        const nextHour = scores[currentStartIndex - 1];
        if (nextHour.score >= threshold && (endIndex - (currentStartIndex - 1)) < maxDuration) {
            currentStartIndex--;
        } else {
            break;
        }
    }

    // Expand forwards
    let currentEndIndex = endIndex;
    while (currentEndIndex < scores.length - 1) {
        const nextHour = scores[currentEndIndex + 1];
        if (nextHour.score >= threshold && ((currentEndIndex + 1) - currentStartIndex) < maxDuration) {
            currentEndIndex++;
        } else {
            break;
        }
    }
    
    const finalWindow = scores.slice(currentStartIndex, currentEndIndex + 1);
    const finalAvgScore = finalWindow.reduce((sum, h) => sum + h.score, 0) / finalWindow.length;

    return {
        start: finalWindow[0].time,
        end: finalWindow[finalWindow.length - 1].time,
        avgScore: Math.round(finalAvgScore),
    };
}


// --- Daypart Scoring ---

export async function getScoreStatus(score: number): Promise<ScoreStatus> {
    if (score > 87) return "Excellent";
    if (score > 75) return "Great";
    if (score >= 63) return "Fair";
    return "Bad";
}

async function findBestSubWindow(hours: ScoredHour[]): Promise<{ start: string; end: string, status: ScoreStatus, score: number } | null> {
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
        status: await getScoreStatus(avgScore),
        score: Math.round(avgScore)
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

    const daypartDefinitions: { name: DaypartName, label: string, start: Date; end: Date }[] = [
        { name: 'Morning',   label: 'Morn',  start: subMinutes(sunrise, 60),      end: addMinutes(solarNoon, -120) },
        { name: 'Midday',    label: 'Mid',   start: addMinutes(solarNoon, -120),  end: addMinutes(solarNoon, 120) },
        { name: 'Afternoon', label: 'Aft',   start: addMinutes(solarNoon, 120),   end: subMinutes(sunset, -30) },
        { name: 'Evening',   label: 'Eve',   start: addMinutes(sunset, -30),      end: addMinutes(sunset, 90) },
        { name: 'Night',     label: 'Night', start: addMinutes(sunset, 90),       end: addHours(subMinutes(sunrise, 60), 24) }
    ];
    
    const results: DaypartScore[] = [];

    for (const part of daypartDefinitions) {
        const { name, label, start, end } = part;
        
        const scoresInPart = hourlyScores.filter(h => {
             const hTime = parseISO(h.time);
             return isWithinInterval(hTime, {start, end});
        });

        if (scoresInPart.length === 0) {
             results.push({ name, label, score: 0, status: "Poor", hasWindow: false, isCurrent: false });
             continue;
        }

        const sortedScores = [...scoresInPart].sort((a, b) => b.score - a.score);
        const top60PercentCount = Math.max(2, Math.ceil(sortedScores.length * 0.6));
        const topScores = sortedScores.slice(0, top60PercentCount);
        
        const avgScore = Math.round(topScores.reduce((sum, h) => sum + h.score, 0) / topScores.length);
        const status = await getScoreStatus(avgScore);
        const bestWindow = await findBestSubWindow(scoresInPart);
        
        const isCurrent = isWithinInterval(now, { start, end });

        results.push({
            name,
            label,
            score: avgScore,
            status,
            hasWindow: !!bestWindow,
            isCurrent,
        });
    }

    return results;
}

export async function getOverallDayScore(daypartScores: DaypartScore[], hourlyScores: ScoredHour[]): Promise<OverallDayScore> {
    if (!hourlyScores || hourlyScores.length === 0) {
        return {
            dayAvgScore: 0,
            dayStatus: "Poor",
        };
    }
    
    // Use a more robust mean of top scores to represent the day's potential
    const sortedScores = [...hourlyScores].sort((a, b) => b.score - b.score);
    const top70PercentCount = Math.ceil(sortedScores.length * 0.7);
    const topScores = sortedScores.slice(0, top70PercentCount);
    
    const dayAvgScore = Math.round(topScores.reduce((sum, h) => sum + h.score, 0) / topScores.length);
    const dayStatus = await getScoreStatus(dayAvgScore);
    
    return { dayAvgScore, dayStatus };
}
