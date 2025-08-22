

import type { Species, HourPoint, DayContext, RecentWindow, ScoredHour, ScoreStatus, OverallDayScore, RecommendedWindow, ThreeHourIntervalScore, TodaysChances, WeatherApiResponse, Window } from './types';
import { parseISO, isWithinInterval, addMinutes, subMinutes, format, getHours, getMinutes, differenceInMinutes, addHours, differenceInHours, startOfHour, isSameHour, isToday, startOfDay, endOfDay, isFuture } from 'date-fns';
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
    if (value > 0.94 || value < 0.06) { // New Moon
        const bonus = bonuses.find(b => b.phase === 'new');
        return bonus ? bonus.score : 75;
    } else if (value > 0.44 && value < 0.56) { // Full Moon
        const bonus = bonuses.find(b => b.phase === 'full');
        return bonus ? bonus.score : 75;
    } else if (value >= 0.06 && value <= 0.44) { // Waxing
        const bonus = bonuses.find(b => b.phase === 'waxing');
        return bonus ? bonus.score : 75;
    } else if (value >= 0.56 && value <= 0.94) { // Waning
        const bonus = bonuses.find(b => b.phase === 'waning');
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

export async function recommendWindows(allScores: ScoredHour[], threshold: number = 60, preferredDuration: number = 4, maxDuration: number = 8): Promise<RecommendedWindow | null> {
    if (!allScores || allScores.length === 0) return null;
    
    let scoresToUse = allScores;
    const futureScores = allScores.filter(h => isFuture(parseISO(h.time)));

    if (futureScores.length >= preferredDuration) {
        scoresToUse = futureScores;
    } else if (allScores.length < preferredDuration) {
        return null; // Not enough data to form a window
    }


    let bestWindow: ScoredHour[] | null = null;
    let maxAvgScore = -1;

    // 1. Find the best continuous 4-hour window
    for (let i = 0; i <= scoresToUse.length - preferredDuration; i++) {
        const window = scoresToUse.slice(i, i + preferredDuration);
        const avgScore = window.reduce((sum, h) => sum + h.score, 0) / preferredDuration;
        if (avgScore > maxAvgScore) {
            maxAvgScore = avgScore;
            bestWindow = window;
        }
    }

    if (!bestWindow || maxAvgScore < threshold) {
        // Fallback if no window meets the average threshold: find the single best hour
        if (scoresToUse.length > 0) {
            const bestHour = scoresToUse.reduce((best, current) => current.score > best.score ? current : best, scoresToUse[0]);
             return {
                start: bestHour.time,
                end: addHours(parseISO(bestHour.time), 1).toISOString(),
                avgScore: bestHour.score
            };
        }
        return null;
    }

    // 2. Expand this window outwards up to 8 hours, as long as scores are above threshold
    let startIndex = scoresToUse.indexOf(bestWindow[0]);
    let endIndex = scoresToUse.indexOf(bestWindow[bestWindow.length - 1]);

    // Expand backwards
    let currentStartIndex = startIndex;
    while (currentStartIndex > 0) {
        const nextHour = scoresToUse[currentStartIndex - 1];
        if (nextHour.score >= threshold && (endIndex - (currentStartIndex - 1)) < maxDuration) {
            currentStartIndex--;
        } else {
            break;
        }
    }

    // Expand forwards
    let currentEndIndex = endIndex;
    while (currentEndIndex < scoresToUse.length - 1) {
        const nextHour = scoresToUse[currentEndIndex + 1];
        if (nextHour.score >= threshold && ((currentEndIndex + 1) - currentStartIndex) < maxDuration) {
            currentEndIndex++;
        } else {
            break;
        }
    }
    
    const finalWindow = scoresToUse.slice(currentStartIndex, currentEndIndex + 1);
    const finalAvgScore = finalWindow.reduce((sum, h) => sum + h.score, 0) / finalWindow.length;

    return {
        start: finalWindow[0].time,
        end: finalWindow[finalWindow.length - 1].time,
        avgScore: Math.round(finalAvgScore),
    };
}


// --- Daypart Scoring ---

export function getScoreStatus(score: number): ScoreStatus {
    if (score >= 90) return "Prime";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Fair-Slow";
    if (score >= 35) return "Poor";
    return "Very Poor";
}


export async function calculate3HourIntervalScores(hourlyScores: ScoredHour[]): Promise<ThreeHourIntervalScore[]> {
    if (!hourlyScores || hourlyScores.length === 0) {
        return [];
    }

    const now = new Date();
    const currentHour = startOfHour(now);

    // Find the starting index in the hourlyScores array
    const startIndex = hourlyScores.findIndex(h => isSameHour(parseISO(h.time), currentHour));
    const relevantScores = startIndex !== -1 ? hourlyScores.slice(startIndex) : hourlyScores;

    const results: ThreeHourIntervalScore[] = [];

    // Create up to 8 intervals (24 hours)
    for (let i = 0; i < relevantScores.length && results.length < 8; i += 3) {
        const chunk = relevantScores.slice(i, i + 3);
        if (chunk.length === 0) continue;

        const avgScore = Math.round(chunk.reduce((sum, h) => sum + h.score, 0) / chunk.length);
        const status = getScoreStatus(avgScore);

        // Find the most frequent condition in the chunk
        const conditionCounts = chunk.reduce((acc, h) => {
            acc[h.condition] = (acc[h.condition] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const mostFrequentCondition = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b);

        let label = '';
        if (i === 0) {
            label = 'Now';
        } else {
            label = format(parseISO(chunk[0].time), 'ha').toLowerCase();
        }
        
        const isCurrent = i === 0;

        results.push({
            label,
            score: avgScore,
            status,
            condition: mostFrequentCondition,
            isCurrent
        });
    }

    return results;
}

export async function getOverallDayScore(hourlyScores: ScoredHour[]): Promise<OverallDayScore> {
    if (!hourlyScores || hourlyScores.length === 0) {
        return {
            dayAvgScore: 0,
            dayStatus: "Poor",
        };
    }
    
    // Use a more robust mean of top scores to represent the day's potential
    const sortedScores = [...hourlyScores].sort((a, b) => b.score - a.score);
    const top70PercentCount = Math.ceil(sortedScores.length * 0.7);
    const topScores = sortedScores.slice(0, top70PercentCount);
    
    const dayAvgScore = Math.round(topScores.reduce((sum, h) => sum + h.score, 0) / topScores.length);
    const dayStatus = getScoreStatus(dayAvgScore);
    
    return { dayAvgScore, dayStatus };
}

function getMoonPhase(date: Date = new Date()): number {
  const JD = date.getTime() / 86400000 + 2440587.5; // Julian day
  const JD0 = 2451550.1; // Known new moon (2000-01-06 18:14 UTC)
  const LUNAR_CYCLE = 29.530588853; // Synodic month
  let phase = ((JD - JD0) / LUNAR_CYCLE) % 1;
  if (phase < 0) phase += 1;
  return phase; // Returns a value from 0 (new) to 1 (new)
}

export async function getMoonPhaseName(phase: number): Promise<string> {
  if (phase < 0.03 || phase > 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
}

// --- Today's Chances Logic ---

function scoreWindow(base: number, modifiers: number[]): number {
    return Math.max(0, Math.min(100, Math.round(base + modifiers.reduce((a, b) => a + b, 0))));
}

export async function computeTodaysChances(weather: WeatherApiResponse, species: Species | 'auto'): Promise<TodaysChances> {
    const today = new Date();
    const todaysHourly = weather.hourly.filter(h => isToday(parseISO(h.t)));
    const todaysDaily = weather.daily.find(d => isToday(parseISO(d.sunrise)));
    const locationName = "Current Location"; // Or pass in from props

    if (!todaysDaily || todaysHourly.length < 24) {
        return {
            date: format(today, "yyyy-MM-dd"),
            location: locationName,
            todayScore: 45,
            band: 'Poor',
            windows: [],
            bestOverallWindow: null,
            factors: { windKphNow: 0, pressureTrend6h_hPa: 0, uvIndexMax: 0, tempNowC: 0 },
            recommendations: ["Not enough data for a reliable forecast."],
            daypartScores: [],
        };
    }

    const speciesToUse: Species = species === 'auto' ? 'Bream' : species;

    const scoredHours: ScoredHour[] = await Promise.all(todaysHourly.map(async (hour) => ({
      time: hour.t,
      score: await scoreHour(speciesToUse, hour, todaysDaily, weather.recent),
      condition: hour.derived.light > 0.5 ? 'Clear' : 'Cloudy', // Simplified condition
      temperature: Math.round(hour.tempC)
    })));

    const overallScore = await getOverallDayScore(scoredHours);
    const daypartScores = await calculate3HourIntervalScores(scoredHours);
    const bestWindow = await recommendWindows(scoredHours, 60, 4, 8);
    
    const now = new Date();
    const currentHourIndex = todaysHourly.findIndex(h => getHours(parseISO(h.t)) === getHours(now));
    const currentHour = todaysHourly[currentHourIndex >= 0 ? currentHourIndex : 0];

    const pressure6hAgoIndex = Math.max(0, currentHourIndex - 6);
    const pressureTrend6h_hPa = currentHour.pressureHpa - todaysHourly[pressure6hAgoIndex].pressureHpa;

    const recommendations = [
        `Focus on the ${bestWindow ? 'recommended window' : 'dawn and dusk periods'}.`,
        "Adapt your technique based on real-time conditions on the water."
    ];

    return {
        date: format(today, "yyyy-MM-dd"),
        location: locationName,
        todayScore: overallScore.dayAvgScore,
        band: overallScore.dayStatus,
        windows: [], // This can be deprecated or adapted if needed
        bestOverallWindow: bestWindow,
        factors: {
            windKphNow: currentHour.windKph,
            pressureTrend6h_hPa,
            uvIndexMax: todaysDaily.uvMax,
            tempNowC: currentHour.tempC
        },
        recommendations,
        daypartScores,
    };
}
