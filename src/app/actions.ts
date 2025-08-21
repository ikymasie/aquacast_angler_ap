
'use server';

import type { Species, Location, ScoredHour, OverallDayScore, ThreeHourIntervalScore, LureFamily, DayContext } from "@/lib/types";
import { fetchWeatherData } from "@/services/weather/openMeteo";
import { scoreHour, calculate3HourIntervalScores, getOverallDayScore } from "@/lib/scoring";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, isToday, startOfHour } from "date-fns";
import type { CastingAdviceInput } from "@/ai/flows/casting-advice-flow";
import { getCastingAdvice } from "@/ai/flows/casting-advice-flow";

interface GetScoreActionPayload {
  species: Species;
  location: Location;
  date: string; // ISO string for the selected date
}

export async function getFishingForecastAction(payload: GetScoreActionPayload) {
  try {
    const { species, location, date } = payload;
    const weatherData = await fetchWeatherData(location);

    const selectedDate = parseISO(date);
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

    // Find the daily data for the selected day from the 7-day forecast data
    const dayIndex = weatherData.daily.findIndex(d => new Date(d.sunrise).toDateString() === selectedDate.toDateString());
    const selectedDayData = weatherData.daily[dayIndex >= 0 ? dayIndex : 0];

    if (!selectedDayData) {
        return { data: null, error: "Could not retrieve daily forecast data for the selected date."};
    }
    
    // Robustly filter hours by comparing the date part of the timestamp.
    // This avoids timezone issues that caused previous errors.
    const hoursForDay = weatherData.hourly.filter(h => {
        return h.t.startsWith(selectedDateString);
    });

    // Ensure we have a reasonable number of hours to create a forecast.
    if (!hoursForDay || hoursForDay.length < 12) { 
      return { data: null, error: "Not enough forecast data is available to create a forecast for the selected date."};
    }

    const scoredHours: ScoredHour[] = await Promise.all(hoursForDay.map(async (hour) => ({
      time: hour.t,
      score: await scoreHour(species, hour, selectedDayData, weatherData.recent),
      condition: hour.derived.light > 0.5 ? 'Clear' : 'Cloudy', // Simple condition for the icon
      temperature: Math.round(hour.tempC)
    })));
    
    // Check if we have any scores to process
    if (scoredHours.length === 0) {
        return { data: null, error: "Not enough data to create a forecast." };
    }

    // Format hourly data for the chart, ensuring we have data
    const hourlyChartData = scoredHours.map(h => ({
        time: format(parseISO(h.time), 'ha'),
        success: Math.round(h.score),
        condition: h.condition,
        temperature: h.temperature
    }));

    const threeHourScores: ThreeHourIntervalScore[] = await calculate3HourIntervalScores(scoredHours);
    
    const overallDayScore = await getOverallDayScore(scoredHours);

    return { 
      data: {
        hourlyChartData,
        threeHourScores,
        overallDayScore,
      }, 
      error: null 
    };
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching weather data.";
    return { data: null, error: errorMessage };
  }
}


function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}


interface AddSpotPayload {
    lat: number;
    lng: number;
    name: string;
}

export async function addSpotAction(payload: AddSpotPayload) {
    try {
        const { lat, lng, name } = payload;

        // Construct the URL for our new API route.
        const apiUrl = process.env.NODE_ENV === 'production'
            ? `https://YOUR_PRODUCTION_DOMAIN/api/place-from-latlng?lat=${lat}&lng=${lng}`
            : `http://localhost:9002/api/place-from-latlng?lat=${lat}&lng=${lng}`;


        const response = await fetch(apiUrl, { cache: 'no-store' });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `Failed to fetch place details: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.place && !data.geocode) {
            throw new Error("Could not find location information for the selected spot.");
        }

        const generatedName = data.place?.displayName?.text || data.geocode?.formattedAddress || "Unnamed Spot";
        const nearestTown = generatedName.split(',')[0];
        
        const newSpot = {
            id: data.place?.id || `spot_${new Date().getTime()}`,
            name: name || generatedName,
            region: "custom",
            waterbody_type: "user-added",
            nearest_town: nearestTown,
            coordinates: { lat, lon: lng },
            representative_species: ["bass", "bream/tilapia", "catfish"],
            notes: `Added on ${new Date().toLocaleDateString()}`,
            image_url: `https://placehold.co/400x300.png`,
            isFavorite: false,
            isRecent: true,
        };

        return { data: newSpot, error: null };

    } catch (err) {
        console.error("Failed to process new spot:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while adding the spot.";
        return { data: null, error: errorMessage };
    }
}

export async function getCastingAdviceAction(payload: CastingAdviceInput) {
    try {
        const advice = await getCastingAdvice(payload);
        return { data: advice, error: null };
    } catch (err) {
        console.error("Failed to get casting advice:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while getting casting advice.";
        return { data: null, error: errorMessage };
    }
}
