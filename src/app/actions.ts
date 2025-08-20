'use server';

import type { Species, Location, ScoredHour } from "@/lib/types";
import { fetchWeatherData } from "@/services/weather/openMeteo";
import { scoreHour, recommendWindows } from "@/lib/scoring";
import { format, parseISO } from "date-fns";

interface GetScoreActionPayload {
  species: Species;
  location: Location;
}

export async function getFishingForecastAction(payload: GetScoreActionPayload) {
  try {
    const { species, location } = payload;
    const weatherData = await fetchWeatherData(location);

    const now = new Date();
    // Filter to start from the current hour
    const futureHours = weatherData.hourly.filter(h => parseISO(h.t) >= now);

    if (futureHours.length === 0) {
      return { data: null, error: "Could not retrieve future forecast data."};
    }

    const scoredHours: ScoredHour[] = await Promise.all(futureHours.map(async (hour) => ({
      time: hour.t,
      score: await scoreHour(species, hour, weatherData.daily, weatherData.recent),
    })));
    
    // Check if we have any scores to process
    if (scoredHours.length === 0) {
        return { data: null, error: "Not enough data to create a forecast." };
    }

    const currentScore = scoredHours[0].score;
    const recommendedTimeWindow = await recommendWindows(scoredHours.slice(0, 24)); // Recommend based on next 24h

    // Format hourly data for the chart, ensuring we have data
    const hourlyChartData = scoredHours.slice(0, 24).map(h => ({
        time: format(parseISO(h.time), 'ha'),
        success: Math.round(h.score)
    }));

    return { 
      data: {
        successScore: currentScore,
        recommendedTimeWindow,
        hourlyChartData,
      }, 
      error: null 
    };
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching weather data.";
    return { data: null, error: errorMessage };
  }
}
