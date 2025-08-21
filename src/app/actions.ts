
'use server';

import type { Species, Location, ScoredHour, OverallDayScore, ThreeHourIntervalScore, LureFamily, DayContext, HourPoint, RecentWindow, UserSpot } from "@/lib/types";
import { fetchWeatherData } from "@/services/weather/openMeteo";
import { scoreHour, calculate3HourIntervalScores, getOverallDayScore } from "@/lib/scoring";
import { format, parseISO, startOfToday, endOfDay, isWithinInterval, isToday, startOfHour } from "date-fns";
import type { CastingAdviceInput } from "@/ai/flows/casting-advice-flow";
import { getCastingAdvice } from "@/ai/flows/casting-advice-flow";
import { getLureAdvice } from "@/ai/flows/lure-advice-flow";
import { z } from 'zod';
import { analyzePhoto, type PhotoAnalysisInput } from "@/ai/flows/photo-analysis-flow";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc } from "firebase/firestore";


const LureAdviceInputSchema = z.object({
  species: z.custom<Species>(),
  lureFamily: z.custom<LureFamily>(),
  dayContext: z.custom<DayContext>(),
  currentHour: z.custom<HourPoint>(),
  recentWindow: z.custom<RecentWindow>(),
});

interface GetScoreActionPayload {
  species: Species;
  location: Location;
  date: string; // ISO string for the selected date
}

export async function getFishingForecastAction(payload: GetScoreActionPayload) {
  try {
    const { species, location, date } = payload;
    const weatherData = await fetchWeatherData(location);

    // Use the date part of the ISO string directly to avoid timezone issues.
    const selectedDateString = date.substring(0, 10); // e.g., "2025-08-21"
    
    // Find the daily data for the selected day from the 7-day forecast data
    const selectedDayData = weatherData.daily.find(d => d.sunrise.startsWith(selectedDateString));

    if (!selectedDayData) {
        return { data: null, error: `Daily forecast data is not available for ${selectedDateString}.`};
    }
    
    const hoursForDay = weatherData.hourly.filter(h => h.t.startsWith(selectedDateString));

    if (hoursForDay.length === 0) {
      return { data: null, error: "Not enough forecast data is available to create a forecast for the selected date."};
    }

    const scoredHours: ScoredHour[] = await Promise.all(hoursForDay.map(async (hour) => ({
      time: hour.t,
      score: await scoreHour(species, hour, selectedDayData, weatherData.recent),
      condition: hour.derived.light > 0.5 ? 'Clear' : 'Cloudy', // Simple condition for the icon
      temperature: Math.round(hour.tempC)
    })));
    
    const hourlyChartData = scoredHours.map(h => ({
        time: format(parseISO(h.time), 'ha'),
        success: Math.round(h.score),
        condition: h.condition,
        temperature: h.temperature
    }));

    let threeHourScores: ThreeHourIntervalScore[] = [];
    let overallDayScore: OverallDayScore | null = null;

    if (scoredHours.length > 0) {
      threeHourScores = await calculate3HourIntervalScores(scoredHours);
      overallDayScore = await getOverallDayScore(scoredHours);
    }

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
    userId: string;
    lat: number;
    lng: number;
    name: string;
}

export async function addSpotAction(payload: AddSpotPayload) {
    try {
        const { userId, lat, lng, name } = payload;
        
        if (!userId) {
            throw new Error("User is not authenticated.");
        }

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
        
        const newSpot: Omit<UserSpot, 'id'> = {
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

        const userSpotsCollectionRef = collection(db, 'users', userId, 'spots');
        const docRef = await addDoc(userSpotsCollectionRef, newSpot);

        return { data: { id: docRef.id, ...newSpot }, error: null };

    } catch (err) {
        console.error("Failed to process new spot:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while adding the spot.";
        return { data: null, error: errorMessage };
    }
}

export async function getUserSpotsAction(userId: string): Promise<{ data: UserSpot[] | null, error: string | null }> {
    try {
        if (!userId) {
            throw new Error("User is not authenticated.");
        }
        const spotsCollectionRef = collection(db, 'users', userId, 'spots');
        const querySnapshot = await getDocs(spotsCollectionRef);
        
        const spots = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserSpot));

        return { data: spots, error: null };

    } catch (err) {
        console.error("Failed to fetch user spots:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching spots.";
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


export async function getLureAdviceAction(payload: z.infer<typeof LureAdviceInputSchema>) {
    try {
        const validatedPayload = LureAdviceInputSchema.parse(payload);
        const advice = await getLureAdvice(validatedPayload);
        return { data: advice, error: null };
    } catch (err) {
        console.error("Failed to get lure advice:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while getting lure advice.";
        return { data: null, error: errorMessage };
    }
}

export async function analyzePhotoAction(payload: PhotoAnalysisInput) {
    try {
        const result = await analyzePhoto(payload);
        return { data: result, error: null };
    } catch (err) {
        console.error("Failed to analyze photo:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during photo analysis.";
        return { data: null, error: errorMessage };
    }
}
