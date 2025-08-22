
'use server';

import type { Species, Location, ScoredHour, OverallDayScore, ThreeHourIntervalScore, LureFamily, DayContext, HourPoint, RecentWindow, UserSpot, WeatherApiResponse } from "@/lib/types";
import { fetchWeatherData } from "@/services/weather/openMeteo";
import { scoreHour, calculate3HourIntervalScores, getOverallDayScore } from "@/lib/scoring";
import { format, parseISO, startOfToday, endOfDay, isWithinInterval, isToday, startOfHour, isBefore, addHours, startOfWeek, isSameWeek } from "date-fns";
import type { CastingAdviceInput } from "@/ai/flows/castingAdvice-flow";
import { getCastingAdvice } from "@/ai/flows/casting-advice-flow";
import { getLureAdvice } from "@/ai/flows/lure-advice-flow";
import { z } from 'zod';
import { analyzePhoto, type PhotoAnalysisInput } from "@/ai/flows/photo-analysis-flow";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, orderBy, limit, where } from "firebase/firestore";
import { getDrillAnalysis } from '@/ai/flows/drill-analysis-flow';
import allQuests from '@/lib/quests.json';
import { getSuggestedDrill } from "@/ai/flows/suggest-drill-flow";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";


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
        
        const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002';
        const apiUrl = `${host}/api/place-from-latlng?lat=${lat}&lng=${lng}`;


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


export async function getPracticeSessionsAction(userId: string): Promise<{ data: any[] | null, error: string | null }> {
    try {
        if (!userId) {
            throw new Error("User not authenticated.");
        }
        const sessionsRef = collection(db, 'users', userId, 'practiceSessions');
        const q = query(sessionsRef, orderBy('startTime', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);

        const sessions = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Timestamps to ISO strings for serialization
                startTime: data.startTime?.toDate().toISOString() || null,
                endTime: data.endTime?.toDate().toISOString() || null,
            };
        });

        return { data: sessions, error: null };

    } catch (err) {
        console.error("Failed to fetch practice sessions:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { data: null, error: errorMessage };
    }
}

// --- Weekly Quests Actions ---

function checkQuestCompletion(quest: any, sessions: any[]): boolean {
    // This is a simplified checker. A real implementation would be more robust.
    const { metric, target, scope } = quest.criteria;
    
    if (metric === "practice_species") {
        const practicedSpecies = new Set(sessions.map(s => s.speciesKey));
        return practicedSpecies.size >= target;
    }
    
    if (metric === "final_score" && scope?.drillKey) {
        const relevantSessions = sessions.filter(s => s.drillKey.includes(scope.drillKey));
        if (relevantSessions.length === 0) return false;
        // In a real app, you'd calculate this KPI from attempt data.
        // For now, we'll use the final score as a proxy.
        return relevantSessions.some(s => (s.finalScore || 0) >= target);
    }
    
     if (metric === "session_in_wind" && scope?.min_wind_kph) {
        // This requires weather data per session, which we don't store yet.
        // We'll simulate it for now.
        return sessions.length > 2; // Simulate completion
    }

    return false;
}

export async function getOrGenerateWeeklyQuestsAction(userId: string): Promise<{ data: any[] | null, error: string | null }> {
    if (!userId) return { data: null, error: "User not authenticated." };

    try {
        const questsRef = doc(db, 'users', userId, 'quests', 'weekly');
        const questsSnap = await getDoc(questsRef);
        const now = new Date();
        
        let activeQuests = [];

        if (questsSnap.exists() && isSameWeek(questsSnap.data().generatedAt.toDate(), now, { weekStartsOn: 1 })) {
            activeQuests = questsSnap.data().quests;
        } else {
            // Generate new quests for the week
            const shuffled = allQuests.quests.sort(() => 0.5 - Math.random());
            activeQuests = shuffled.slice(0, 3).map(q => ({ ...q, isComplete: false }));
            await setDoc(questsRef, { quests: activeQuests, generatedAt: serverTimestamp() });
        }

        // Check completion status against recent sessions
        const { data: sessions } = await getPracticeSessionsAction(userId);
        if (!sessions) {
            return { data: activeQuests.map(q => ({ ...q, isComplete: false })), error: null };
        }
        
        const thisWeeksSessions = (sessions || []).filter(s => s.startTime && isSameWeek(parseISO(s.startTime), now, { weekStartsOn: 1 }));

        const checkedQuests = activeQuests.map((quest: any) => ({
            ...quest,
            isComplete: checkQuestCompletion(quest, thisWeeksSessions)
        }));
        
        // Update Firestore with the latest completion status (optional but good practice)
        if (JSON.stringify(checkedQuests) !== JSON.stringify(activeQuests)) {
            await updateDoc(questsRef, { quests: checkedQuests });
        }

        return { data: checkedQuests, error: null };

    } catch (err) {
        console.error("Failed to fetch or generate quests:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { data: null, error: errorMessage };
    }
}

interface GetSuggestedDrillPayload {
    quests: any[];
    availableDrills: any[];
}

export async function getSuggestedDrillAction(payload: GetSuggestedDrillPayload): Promise<{ data: { drillKey: string } | null, error: string | null }> {
    try {
        const result = await getSuggestedDrill(payload);
        return { data: result, error: null };
    } catch (err) {
        console.error("Failed to get suggested drill:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        return { data: null, error: errorMessage };
    }
}

interface ToggleFavoriteSpotPayload {
  userId: string;
  spotId: string;
  isFavorite: boolean;
}

export async function toggleFavoriteSpotAction(payload: ToggleFavoriteSpotPayload): Promise<{ success: boolean; error: string | null }> {
  try {
    const { userId, spotId, isFavorite } = payload;
    if (!userId) {
      throw new Error("User not authenticated.");
    }
    const spotRef = doc(db, 'users', userId, 'spots', spotId);
    await updateDoc(spotRef, { isFavorite: !isFavorite });
    return { success: true, error: null };
  } catch (err) {
    console.error("Failed to toggle favorite status:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

// --- Account Recovery Actions ---

async function findUserByEmail(email: string): Promise<{ uid: string; phone: string } | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    return {
        uid: userDoc.id,
        phone: userData.phone || '',
    };
}


export async function getMaskedPhoneForUserAction(email: string): Promise<{ data: { maskedPhone: string } | null, error: string | null }> {
    try {
        const userInfo = await findUserByEmail(email);

        if (!userInfo || !userInfo.phone) {
            return { data: null, error: "No account found with that email, or the account has no phone number." };
        }

        const { phone } = userInfo;
        if (phone.length < 4) {
            return { data: { maskedPhone: '****' }, error: null };
        }
        
        const maskedPhone = `+...${phone.slice(-3)}`;
        return { data: { maskedPhone }, error: null };

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown server error occurred.";
        return { data: null, error: errorMessage };
    }
}

export async function recoverAccountAction(email: string, submittedPhone: string): Promise<{ success: boolean, error: string | null }> {
    try {
        const userInfo = await findUserByEmail(email);
        
        if (!userInfo) {
            return { success: false, error: "No account found with that email." };
        }
        
        if (userInfo.phone !== submittedPhone) {
            return { success: false, error: "The phone number you entered does not match our records." };
        }

        // If phone matches, attempt to sign in the user.
        // This part is tricky without admin SDK. We assume client-side handles sign-in.
        // For server-side, you'd typically generate a custom token.
        // Here, we just validate. The client will use the password to sign in.
        return { success: true, error: null };

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown server error occurred during recovery.";
        return { success: false, error: errorMessage };
    }
}
    

    
