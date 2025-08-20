'use server';

import { calculateFishingSuccessScore } from "@/ai/flows/fishing-success-score";
import type { Species, Location, WeatherData } from "@/lib/types";

// This is a simplified input structure for the server action.
// In a real app, you would fetch more detailed data.
interface GetScoreActionPayload {
  species: Species;
  location: Location;
  conditions: WeatherData;
}

export async function calculateFishingSuccessScoreAction(payload: GetScoreActionPayload) {
  try {
    // In a real app, you'd fetch live data for hydro, sunmoon, etc.
    // For this example, we'll use a mix of mock and derived data.
    const now = new Date();
    const data = await calculateFishingSuccessScore({
      species: payload.species,
      location: payload.location.name,
      met: {
        temperature: payload.conditions.temperature,
        windSpeed: payload.conditions.windSpeed,
        humidity: payload.conditions.humidity,
      },
      hydro: {
        waterTemperature: 18, // Mock data
        waterClarity: 'clear', // Mock data
      },
      sunmoon: {
        sunrise: '06:00', // Mock data
        sunset: '20:30', // Mock data
        moonPhase: 'waxing crescent', // Mock data
      },
      clock: {
        currentTime: `${now.getHours()}:${now.getMinutes()}`,
      },
    });

    return { data, error: null };
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return { data: null, error: errorMessage };
  }
}
