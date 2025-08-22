
import type { Species, HourPoint, DayContext, RecentWindow, ScoredHour, ScoreStatus, OverallDayScore, RecommendedWindow, ThreeHourIntervalScore, TodaysChances, WeatherApiResponse, Window } from './types';
import { parseISO, isWithinInterval, addMinutes, subMinutes, format, getHours, getMinutes, differenceInMinutes, addHours, differenceInHours, startOfHour, isSameHour, isToday, startOfDay, endOfDay } from 'date-fns';
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

export async function recommendWindows(allScores: ScoredHour[], futureScores: ScoredHour[], threshold: number = 60, preferredDuration: number = 4, maxDuration: number = 8): Promise<RecommendedWindow | null> {
    const scores = futureScores.length > 0 ? futureScores : allScores;
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

export async function getMoonPhaseName(phase: number): Promise<string> {
  if (phase < 0.06 || phase > 0.94) return 'New Moon';
  if (phase < 0.18) return 'Waxing Crescent';
  if (phase < 0.31) return 'First Quarter';
  if (phase < 0.44) return 'Waxing Gibbous';
  if (phase < 0.56) return 'Full Moon';
  if (phase < 0.69) return 'Waning Gibbous';
  if (phase < 0.81) return 'Last Quarter';
  if (phase < 0.94) return 'Waning Crescent';
  return 'New Moon';
}

// --- Today's Chances Logic ---

function scoreWindow(base: number, modifiers: number[]): number {
    return Math.max(0, Math.min(100, Math.round(base + modifiers.reduce((a, b) => a + b, 0))));
}

export function computeTodaysChances(weather: WeatherApiResponse, species: Species | 'auto'): TodaysChances {
    const today = new Date();
    const todaysHourly = weather.hourly.filter(h => isToday(parseISO(h.t)));
    const todaysDaily = weather.daily.find(d => isToday(parseISO(d.sunrise)));

    if (!todaysDaily || todaysHourly.length < 24) {
        // Fallback for incomplete data
        return {
            date: format(today, "yyyy-MM-dd"),
            location: "Unknown",
            todayScore: 45,
            band: 'Poor',
            windows: [],
            factors: { windKphNow: 0, pressureTrend6h_hPa: 0, uvIndexMax: 0, tempNowC: 0 },
            recommendations: ["Not enough data for a reliable forecast."]
        };
    }

    const now = new Date();
    const currentHourIndex = todaysHourly.findIndex(h => getHours(parseISO(h.t)) === getHours(now));
    const currentHour = todaysHourly[currentHourIndex >= 0 ? currentHourIndex : 0];

    const sunrise = parseISO(todaysDaily.sunrise);
    const sunset = parseISO(todaysDaily.sunset);

    const windows: Window[] = [];

    // Sunrise window
    const sunriseWindowStart = subMinutes(sunrise, 45);
    const sunriseWindowEnd = addMinutes(sunrise, 90);
    const sunriseHourly = todaysHourly.filter(h => isWithinInterval(parseISO(h.t), { start: sunriseWindowStart, end: sunriseWindowEnd }));
    if (sunriseHourly.length > 0) {
        const avgCloud = sunriseHourly.reduce((s, h) => s + h.cloudPct, 0) / sunriseHourly.length;
        const avgWind = sunriseHourly.reduce((s, h) => s + h.windKph, 0) / sunriseHourly.length;
        const avgTemp = sunriseHourly.reduce((s, h) => s + h.tempC, 0) / sunriseHourly.length;
        const sunriseMods = [
            avgCloud >= 30 && avgCloud <= 70 ? 10 : avgCloud > 70 ? 5 : -10,
            avgWind >= 6 && avgWind <= 20 ? 10 : avgWind > 28 ? -10 : avgWind < 3 ? -5 : 0,
            avgTemp >= 12 && avgTemp <= 24 ? 5 : 0
        ];
        windows.push({ label: 'Sunrise', startISO: sunriseWindowStart.toISOString(), endISO: sunriseWindowEnd.toISOString(), score: scoreWindow(70, sunriseMods), reasons: [] });
    }

    // Sunset window
    const sunsetWindowStart = subMinutes(sunset, 90);
    const sunsetWindowEnd = addMinutes(sunset, 45);
    const sunsetHourly = todaysHourly.filter(h => isWithinInterval(parseISO(h.t), { start: sunsetWindowStart, end: sunsetWindowEnd }));
    if (sunsetHourly.length > 0) {
        const avgCloud = sunsetHourly.reduce((s, h) => s + h.cloudPct, 0) / sunsetHourly.length;
        const avgWind = sunsetHourly.reduce((s, h) => s + h.windKph, 0) / sunsetHourly.length;
        const avgTemp = sunsetHourly.reduce((s, h) => s + h.tempC, 0) / sunsetHourly.length;
        const sunsetMods = [
            avgCloud >= 30 && avgCloud <= 70 ? 10 : avgCloud > 70 ? 5 : -10,
            avgWind >= 6 && avgWind <= 20 ? 10 : avgWind > 28 ? -10 : avgWind < 3 ? -5 : 0,
            avgTemp >= 12 && avgTemp <= 24 ? 5 : 0
        ];
        windows.push({ label: 'Sunset', startISO: sunsetWindowStart.toISOString(), endISO: sunsetWindowEnd.toISOString(), score: scoreWindow(70, sunsetMods), reasons: [] });
    }

    // Rain window(s)
    const pressure6hAgoIndex = Math.max(0, currentHourIndex - 6);
    const pressureTrend6h_hPa = currentHour.pressureHpa - todaysHourly[pressure6hAgoIndex].pressureHpa;
    const rainHours = todaysHourly.filter(h => h.isDay && (h.precipProb ?? 0) >= 25 && (h.precipProb ?? 0) <= 85 && h.precipMm <= 2);
    if (rainHours.length > 0) {
        const rainMods = [
            rainHours[0].precipMm >= 0.2 && rainHours[0].precipMm <= 1.0 ? 10 : rainHours[0].precipMm > 1.0 && rainHours[0].precipMm <= 2.0 ? 5 : -15,
            rainHours[0].cloudPct >= 40 && rainHours[0].cloudPct <= 90 ? 5 : 0,
            rainHours[0].windKph >= 6 && rainHours[0].windKph <= 18 ? 5 : rainHours[0].windKph > 30 ? -10 : 0,
            pressureTrend6h_hPa <= -1.5 ? 10 : pressureTrend6h_hPa >= 1.5 ? -10 : 0
        ];
        windows.push({ label: 'Rain', startISO: rainHours[0].t, endISO: rainHours[rainHours.length - 1].t, score: scoreWindow(65, rainMods), reasons: [] });
    }
    
    // Moon boost
    const phase = todaysDaily.moonPhase;
    const isNewOrFull = (phase >= 0.9 || phase <= 0.1) || (phase >= 0.45 && phase <= 0.55);
    if(isNewOrFull) {
        const moonMods = [
             (phase > 0.95 || phase < 0.05 || (phase > 0.48 && phase < 0.52)) ? 10 : 0
        ];
         windows.push({ label: phase > 0.9 || phase < 0.1 ? 'Moon (new)' : 'Moon (full)', startISO: sunset.toISOString(), endISO: addHours(sunset, 4).toISOString(), score: scoreWindow(60, moonMods), reasons: [] });
    }

    // Today Score
    const maxBiteTimeScore = Math.max(...windows.filter(w => w.label === "Sunrise" || w.label === "Sunset").map(w => w.score), 0);
    const rainScore = windows.find(w => w.label === "Rain")?.score || 0;
    const moonScore = windows.find(w => w.label.includes("Moon"))?.score || 0;
    
    const contextBonus = [
        pressureTrend6h_hPa < 0 ? 6 : 0,
        currentHour.windKph >= 6 && currentHour.windKph <= 20 ? 4 : 0,
        currentHour.tempC >= 34 || currentHour.tempC <= 5 ? -6 : 0,
        todaysDaily.uvMax > 8 && currentHour.cloudPct < 30 ? -4 : 0
    ].reduce((a, b) => a + b, 0);

    const todayScore = Math.round(
        0.35 * maxBiteTimeScore +
        0.25 * rainScore +
        0.20 * moonScore +
        0.20 * contextBonus
    );

    const recommendations = [
        "Prioritize sunrise windward points or shade lines; move fast in first 90 minutes.",
        "If drizzle arrives, fish inflows and color-change edges; slow presentations."
    ];

    return {
        date: format(today, "yyyy-MM-dd"),
        location: 'Current Location',
        todayScore: Math.max(0, Math.min(100, todayScore)),
        band: getScoreStatus(todayScore),
        windows,
        factors: {
            windKphNow: currentHour.windKph,
            pressureTrend6h_hPa,
            uvIndexMax: todaysDaily.uvMax,
            tempNowC: currentHour.tempC
        },
        recommendations
    };
}
