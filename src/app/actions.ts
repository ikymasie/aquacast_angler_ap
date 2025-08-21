
'use server';

import type { Species, Location, ScoredHour, OverallDayScore, ThreeHourIntervalScore, LureFamily, DayContext, HourPoint, RecentWindow, UserSpot, WeatherApiResponse } from "@/lib/types";
import { fetchWeatherData } from "@/services/weather/openMeteo";
import { scoreHour, calculate3HourIntervalScores, getOverallDayScore } from "@/lib/scoring";
import { format, parseISO, startOfToday, endOfDay, isWithinInterval, isToday, startOfHour, isBefore, addHours } from "date-fns";
import type { CastingAdviceInput } from "@/ai/flows/casting-advice-flow";
import { getCastingAdvice } from "@/ai/flows/casting-advice-flow";
import { getLureAdvice } from "@/ai/flows/lure-advice-flow";
import { z } from 'zod';
import { analyzePhoto, type PhotoAnalysisInput } from "@/ai/flows/photo-analysis-flow";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { getDrillAnalysis } from '@/ai/flows/drill-analysis-flow';


const LureAdviceInputSchema = z.object({
  species: z.custom<Species>(),
  lureFamily: z.custom<LureFamily>(),
  dayContext: z.custom<DayContext>(),
  currentHour: z.custom<HourPoint>(),
  recentWindow: z.custom<RecentWindow>(),
});

interface GetScoreActionPayload {
  userId: string;
  species: Species;
  location: Location;
  date: string; // ISO string for the selected date
}

export async function getFishingForecastAction(payload: GetScoreActionPayload) {
  try {
    const { userId, species, location, date } = payload;

    const selectedDateString = date.substring(0, 10);
    const locationKey = `${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`;
    const weatherCacheRef = doc(db, 'weather_cache', `${locationKey}_${selectedDateString}`);
    const weatherCacheSnap = await getDoc(weatherCacheRef);
    let weatherData: WeatherApiResponse;
    const CACHE_EXPIRATION_HOURS = 4;

    if (weatherCacheSnap.exists()) {
        const cachedData = weatherCacheSnap.data();
        const cacheTimestamp = cachedData.timestamp.toDate();
        if (isBefore(new Date(), addHours(cacheTimestamp, CACHE_EXPIRATION_HOURS))) {
            weatherData = cachedData.data as WeatherApiResponse;
        } else {
            weatherData = await fetchWeatherData(location);
            await setDoc(weatherCacheRef, { data: weatherData, timestamp: new Date() });
        }
    } else {
        weatherData = await fetchWeatherData(location);
        await setDoc(weatherCacheRef, { data: weatherData, timestamp: new Date() });
    }

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
      condition: hour.derived.light > 0.5 ? 'Clear' : 'Cloudy',
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

      // Save the scores to Firestore for the user
      const userForecastRef = doc(db, 'users', userId, 'forecasts', `${locationKey}_${selectedDateString}_${species}`);
      await setDoc(userForecastRef, {
        species,
        location,
        date: selectedDateString,
        threeHourScores,
        overallDayScore,
        hourlyChartData,
        timestamp: new Date()
      });
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
            image_url: `/images/locations/default.jpg`,
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


// Practice Session Actions

interface StartPracticeSessionPayload {
  userId: string;
  drill: any; // The full drill object
}

export async function startPracticeSessionAction(payload: StartPracticeSessionPayload): Promise<{ data: { sessionId: string } | null; error: string | null }> {
    try {
        const { userId, drill } = payload;
        if (!userId) throw new Error("User not authenticated.");

        const sessionData = {
            userId,
            drillKey: drill.drillKey,
            drillName: drill.name,
            speciesKey: drill.speciesKey,
            status: 'in-progress',
            startTime: serverTimestamp(),
            endTime: null,
            finalScore: 0,
            finalGrade: null,
            rounds: [],
        };

        const sessionRef = await addDoc(collection(db, 'users', userId, 'practiceSessions'), sessionData);
        
        return { data: { sessionId: sessionRef.id }, error: null };
    } catch (err) {
        console.error("Failed to start practice session:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { data: null, error: errorMessage };
    }
}


interface SavePracticeAttemptPayload {
    userId: string;
    sessionId: string;
    attemptData: any; // Define a proper type for this
}

export async function savePracticeAttemptAction(payload: SavePracticeAttemptPayload): Promise<{ success: boolean; error: string | null }> {
    try {
        const { userId, sessionId, attemptData } = payload;
        if (!userId || !sessionId) throw new Error("User or session ID missing.");
        
        const sessionRef = doc(db, 'users', userId, 'practiceSessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (!sessionSnap.exists()) throw new Error("Practice session not found.");
        
        const session = sessionSnap.data();
        const currentRounds = session.rounds || [];
        const { roundNumber, ...restOfAttemptData } = attemptData;
        
        const roundIndex = currentRounds.findIndex((r: any) => r.roundNumber === roundNumber);
        
        if (roundIndex > -1) {
            currentRounds[roundIndex].attempts = [...(currentRounds[roundIndex].attempts || []), restOfAttemptData];
        } else {
            currentRounds.push({
                roundNumber,
                attempts: [restOfAttemptData],
                roundScore: 0 // Will be calculated later
            });
        }
        
        await updateDoc(sessionRef, { rounds: currentRounds });

        return { success: true, error: null };
    } catch (err) {
        console.error("Failed to save practice attempt:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}


interface CompletePracticeSessionPayload {
  userId: string;
  sessionId: string;
  finalScore: number;
  finalGrade: string;
}

export async function completePracticeSessionAction(payload: CompletePracticeSessionPayload): Promise<{ success: boolean; error: string | null }> {
    try {
        const { userId, sessionId, finalScore, finalGrade } = payload;
        if (!userId || !sessionId) throw new Error("User or session ID missing.");

        const sessionRef = doc(db, 'users', userId, 'practiceSessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (!sessionSnap.exists()) throw new Error("Session not found");

        const sessionData = sessionSnap.data();
        
        // Generate AI analysis
        const analysis = await getDrillAnalysis({
            session: sessionData, // Pass the whole session data
            kpis: { /* Pass calculated KPIs */ accuracyPct: 75, misses: 3, centerHits: 2 },
            normalizedScore: finalScore,
            band: finalGrade,
        });

        await updateDoc(sessionRef, {
            status: 'completed',
            endTime: serverTimestamp(),
            finalScore,
            finalGrade,
            insights: analysis // Save the insights
        });

        return { success: true, error: null };
    } catch (err) {
        console.error("Failed to complete practice session:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}


interface GetSessionReviewPayload {
    userId: string;
    sessionId: string;
}

export async function getSessionReviewDataAction(payload: GetSessionReviewPayload): Promise<{ data: any | null, error: string | null }> {
    try {
        const { userId, sessionId } = payload;
        if (!userId || !sessionId) {
            throw new Error("User or session ID missing.");
        }

        const sessionRef = doc(db, 'users', userId, 'practiceSessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists() || sessionSnap.data().status !== 'completed') {
            throw new Error("Session review not available or session not completed.");
        }

        const session = sessionSnap.data();
        
        // This is where you would calculate KPIs based on the rounds data
        const timeline = session.rounds?.flatMap((r: any) => r.attempts.map((a: any, i: number) => ({
            idx: i + 1,
            result: a.ring || 'miss',
        }))) || [];

        const kpis = {
            accuracyPct: 72,
            centerHits: 5,
            misses: 3,
            maxStreak: 5,
        };

        const rewards = {
            xp: 381,
            coins: 108,
            streakDelta: 1,
        };
        
        const reviewData = {
            session: {
                drillName: session.drillName,
                finalScore: session.finalScore,
                finalGrade: session.finalGrade,
            },
            timeline,
            kpis,
            rewards,
            insights: session.insights,
        };

        return { data: reviewData, error: null };

    } catch (err) {
        console.error("Failed to get session review data:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { data: null, error: errorMessage };
    }
}

export async function getUsersAction(): Promise<{ data: any[] | null; error: string | null }> {
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        const users = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                displayName: data.displayName,
                rank: data.practiceProfile?.level || 1,
            };
        });

        // Sort users by rank in descending order
        const sortedUsers = users.sort((a, b) => b.rank - a.rank);

        return { data: sortedUsers.slice(0, 50), error: null };

    } catch (err) {
        console.error("Failed to fetch users for leaderboard:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { data: null, error: errorMessage };
    }
}

    