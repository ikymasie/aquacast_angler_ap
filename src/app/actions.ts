
'use server';

import type { Species, Location, ScoredHour, DaypartScore, OverallDayScore } from "@/lib/types";
import { fetchWeatherData } from "@/services/weather/openMeteo";
import { scoreHour, recommendWindows, calculateDaypartScores, getOverallDayScore } from "@/lib/scoring";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

interface GetScoreActionPayload {
  species: Species;
  location: Location;
  date: string; // ISO string for the selected date
}

export async function getFishingForecastAction(payload: GetScoreActionPayload) {
  try {
    const { species, location, date } = payload;
    const weatherData = await fetchWeatherData(location);

    const selectedDay = startOfDay(parseISO(date));

    // Find the daily data for the selected day
    const dayIndex = weatherData.daily.findIndex(d => startOfDay(parseISO(d.sunrise)) >= selectedDay);
    const selectedDayData = weatherData.daily[dayIndex >= 0 ? dayIndex : 0];

    if (!selectedDayData) {
        return { data: null, error: "Could not retrieve daily forecast data for the selected date."};
    }

    // Filter hourly data for the selected 24-hour period
    const dayStart = startOfDay(selectedDay);
    const dayEnd = endOfDay(selectedDay);

    let hoursForDay = weatherData.hourly.filter(h => 
        isWithinInterval(parseISO(h.t), { start: dayStart, end: dayEnd })
    );

    // If no hours are found for today, it might be because the API returned only future hours.
    // In this case, we can use the start of the hourly forecast as our data.
    if (hoursForDay.length === 0 && isWithinInterval(new Date(), { start: dayStart, end: dayEnd })) {
        hoursForDay = weatherData.hourly;
    }
    
    if (hoursForDay.length === 0) {
      return { data: null, error: "Could not retrieve future forecast data."};
    }

    const scoredHours: ScoredHour[] = await Promise.all(hoursForDay.map(async (hour) => ({
      time: hour.t,
      score: await scoreHour(species, hour, selectedDayData, weatherData.recent),
    })));
    
    // Check if we have any scores to process
    if (scoredHours.length === 0) {
        return { data: null, error: "Not enough data to create a forecast." };
    }

    const now = new Date();
    const currentHourIndex = scoredHours.findIndex(h => parseISO(h.time) >= now);
    const currentScore = currentHourIndex !== -1 ? scoredHours[currentHourIndex].score : scoredHours[0].score;

    const recommendedTimeWindow = await recommendWindows(scoredHours);

    // Format hourly data for the chart, ensuring we have data
    const hourlyChartData = scoredHours.map(h => ({
        time: format(parseISO(h.time), 'ha'),
        success: Math.round(h.score)
    }));

    const daypartScores = await calculateDaypartScores(
        scoredHours,
        selectedDayData.sunrise,
        selectedDayData.sunset
    );
    
    const overallDayScore = await getOverallDayScore(daypartScores, scoredHours);

    return { 
      data: {
        successScore: currentScore,
        recommendedTimeWindow,
        hourlyChartData,
        daypartScores,
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
