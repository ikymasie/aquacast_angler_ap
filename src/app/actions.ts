'use server';

import type { Species, Location, ScoredHour } from "@/lib/types";
import { fetchWeatherData } from "@/services/weather/openMeteo";
import { scoreHour, recommendWindows } from "@/lib/scoring";
import { format, parseISO } from "date-fns";
import fs from 'fs/promises';
import path from 'path';

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

async function reverseGeocode(lat: number, lng: number): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Google Maps API key is missing.");

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || data.results.length === 0) {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
    }
    
    const result = data.results[0];
    const locality = result.address_components.find((c: any) => c.types.includes('locality'))?.long_name;
    const administrativeArea = result.address_components.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name;

    if (locality && administrativeArea) {
        return `${locality}, ${administrativeArea}`;
    }
    // Fallback to a formatted address if specific components aren't found
    return result.formatted_address.split(',').slice(0, 2).join(',');
}


export async function addSpotAction(payload: AddSpotPayload) {
    try {
        const { lat, lng } = payload;
        
        // 1. Reverse geocode to get a name
        const name = await reverseGeocode(lat, lng);
        
        // 2. Define the path to the JSON file
        const filePath = path.join(process.cwd(), 'src', 'lib', 'locations.json');
        
        // 3. Read the existing data
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const locations = JSON.parse(fileContent);

        // 4. Create the new spot object
        const newSpot = {
            name: name,
            region: "custom",
            waterbody_type: "user-added",
            nearest_town: name.split(',')[0],
            coordinates: { lat, lon: lng },
            representative_species: ["bass", "bream/tilapia", "catfish"],
            notes: `Added on ${new Date().toLocaleDateString()}`,
            image_url: `https://placehold.co/400x300.png`
        };

        // 5. Add the new spot and write back to the file
        locations.push(newSpot);
        await fs.writeFile(filePath, JSON.stringify(locations, null, 2));

        return { data: { name }, error: null };

    } catch (err) {
        console.error("Failed to add spot:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while adding the spot.";
        return { data: null, error: errorMessage };
    }
}
