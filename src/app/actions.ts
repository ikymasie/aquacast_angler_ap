
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

interface AddSpotPayload {
    lat: number;
    lng: number;
}

export async function addSpotAction(payload: AddSpotPayload) {
    try {
        const { lat, lng } = payload;

        // Construct the URL for our new API route.
        // We assume our app is running on localhost:3000 for server-side fetch.
        // In a production environment, this should be an absolute URL.
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

        const name = data.place?.displayName?.text || data.geocode?.formattedAddress || "Unnamed Spot";
        const nearestTown = name.split(',')[0];
        
        const newSpot = {
            id: data.place?.id || `spot_${new Date().getTime()}`,
            name: name,
            region: "custom",
            waterbody_type: "user-added",
            nearest_town: nearestTown,
            coordinates: { lat, lon: lng },
            representative_species: ["bass", "bream/tilapia", "catfish"],
            notes: `Added on ${new Date().toLocaleDateString()}`,
            image_url: `https://placehold.co/400x300.png?text=${encodeURIComponent(name)}`,
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
