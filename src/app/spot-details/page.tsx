
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import type { Species, Location, WeatherApiResponse, ThreeHourIntervalScore, OverallDayScore, RecommendedWindow, ScoredHour, LureFamily, DayContext, UserSpot } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction, getCastingAdviceAction, getLureAdviceAction, getUserSpotsAction, toggleFavoriteSpotAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { startOfToday, isFuture, parseISO, format, isToday } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from '@/hooks/use-user';
import type { CastingAdviceInput, CastingAdviceOutput } from '@/ai/flows/casting-advice-flow';
import type { LureAdviceOutput } from '@/ai/flows/lure-advice-flow';
import { recommendWindows } from '@/lib/scoring';
import { ForecastTab } from '@/components/spot-details/forecast-tab';
import { CastingTab } from '@/components/spot-details/casting-tab';
import { GalleryTab } from '@/components/spot-details/gallery-tab';
import { ProgressTab } from '@/components/tabs/progress-tab';
import { useToast } from '@/hooks/use-toast';
import { TodaysChancesCard } from '@/components/todays-chances-card';


// Find a spot by name from a combined list of static and user spots.
function getSpotByName(name: string | null, allSpots: any[]) {
  if (!name || allSpots.length === 0) return allSpotsData[0];
  const spot = allSpots.find(s => s.name === name);
  return spot || allSpotsData[0];
}


function SpotDetailsContent() {
    const searchParams = useSearchParams();
    const spotName = searchParams.get('name');
    const { user } = useUser();
    const { toast } = useToast();
    
    const [allAvailableSpots, setAllAvailableSpots] = useState<any[]>([...allSpotsData]);
    const [spot, setSpot] = useState(() => getSpotByName(spotName, allAvailableSpots));

    // Forecast state
    const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bream');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [threeHourScores, setThreeHourScores] = useState<ThreeHourIntervalScore[]>([]);
    const [overallDayScore, setOverallDayScore] = useState<OverallDayScore | null>(null);
    const [recommendedWindow, setRecommendedWindow] = useState<RecommendedWindow | null>(null);
    const [isForecastLoading, setIsForecastLoading] = useState(true);
    const [forecastError, setForecastError] = useState<string | null>(null);
    
    // Casting advice state
    const [selectedLure, setSelectedLure] = useState<LureFamily>('Soft');
    const [advice, setAdvice] = useState<CastingAdviceOutput | null>(null);
    const [isAdviceLoading, setIsAdviceLoading] = useState(false);
    const [lureAdvice, setLureAdvice] = useState<LureAdviceOutput | null>(null);
    const [isLureAdviceLoading, setIsLureAdviceLoading] = useState(false);
    
    // General weather state
    const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(true);

    // Effect to fetch user spots and combine with static spots
    useEffect(() => {
        async function loadSpots() {
            if (user) {
                const { data: userSpots } = await getUserSpotsAction(user.uid);
                const combinedSpots = [
                    ...allSpotsData,
                    ...(userSpots || []).map(s => ({
                        ...s,
                        id: s.id,
                        isUserSpot: true,
                    }))
                ];
                setAllAvailableSpots(combinedSpots);
            }
        }
        loadSpots();
    }, [user]);

    // Effect to update the spot when the name in URL or the list of available spots changes
    useEffect(() => {
        const newSpot = getSpotByName(spotName, allAvailableSpots);
        setSpot(newSpot);
    }, [spotName, allAvailableSpots]);

    const location: Location = useMemo(() => ({
        name: spot.name,
        latitude: spot.coordinates.lat,
        longitude: spot.coordinates.lon,
    }), [spot]);

    const dayContext: DayContext | undefined = useMemo(() => {
        if (!weatherData) return undefined;
        const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
        return weatherData.daily.find(d => d.sunrise.startsWith(selectedDateString));
    }, [weatherData, selectedDate]);


    const loadForecast = useCallback(async (species: Species, date: Date, loc: Location) => {
        if (!user || !weatherData) return;
        setIsForecastLoading(true);
        setForecastError(null);
        
        const forecastResult = await getFishingForecastAction({
            userId: user.uid,
            species: species,
            location: loc,
            date: date.toISOString(),
        });

        if (forecastResult.data) {
             const allScoredHours: ScoredHour[] = (forecastResult.data.hourlyChartData || []).map((d: any, i: number) => {
                 if (!weatherData) return null;
                const correspondingHour = weatherData.hourly.find(h => {
                    const hDate = parseISO(h.t);
                    return format(hDate, 'ha') === d.time && h.t.startsWith(format(date, 'yyyy-MM-dd'));
                });

                if (!correspondingHour) return null;

                 return {
                    time: correspondingHour.t,
                    score: d.success ?? 0,
                    condition: d.condition ?? 'Clear',
                    temperature: d.temperature ?? 0
                 };
             }).filter((h): h is ScoredHour => h !== null);
            
            const recWindow = await recommendWindows(allScoredHours.filter(h => isFuture(parseISO(h.time))));
            
            setRecommendedWindow(recWindow);
            setThreeHourScores(forecastResult.data.threeHourScores || []);
            setOverallDayScore(forecastResult.data.overallDayScore || null);
            setForecastError(null);
        } else {
             setForecastError(forecastResult.error);
             setRecommendedWindow(null);
             setThreeHourScores([]);
             setOverallDayScore(null);
        }

        setIsForecastLoading(false);
    }, [weatherData, user]);

    const loadCastingAdvice = useCallback(async (lure: LureFamily, currentDayContext: DayContext, currentThreeHourScores: ThreeHourIntervalScore[]) => {
        if (!currentDayContext || !currentThreeHourScores.length) return;

        // Caching logic
        const cacheKey = `casting-advice-${spot.name}-${selectedSpecies}-${lure}-${format(selectedDate, 'yyyy-MM-dd')}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                const parsedData = JSON.parse(cachedData);
                // Optional: add a timestamp to invalidate after a few hours
                setAdvice(parsedData);
                return; // Use cached data
            } catch (e) {
                console.error("Failed to parse cached advice", e);
                localStorage.removeItem(cacheKey); // Clear bad data
            }
        }


        setIsAdviceLoading(true);
        const payload: CastingAdviceInput = {
            species: selectedSpecies,
            location,
            lureFamily: lure,
            dayContext: currentDayContext,
            scoredHours: currentThreeHourScores,
        };
        const result = await getCastingAdviceAction(payload);
        if (result.data) {
            setAdvice(result.data);
            try {
                localStorage.setItem(cacheKey, JSON.stringify(result.data));
            } catch(e) {
                console.error("Failed to cache advice", e);
            }
        } else {
            console.error("Advice Error:", result.error);
            setAdvice(null);
        }
        setIsAdviceLoading(false);
    }, [selectedSpecies, location, spot.name, selectedDate]);

    const loadLureAdvice = useCallback(async (lure: LureFamily, currentDayContext: DayContext) => {
        if (!currentDayContext || !weatherData) return;
        setIsLureAdviceLoading(true);

        const now = new Date();
        const currentHour = weatherData.hourly.find(h => isFuture(parseISO(h.t)) || format(parseISO(h.t), 'yyyy-MM-dd-HH') === format(now, 'yyyy-MM-dd-HH'));
        
        if (!currentHour) {
            setIsLureAdviceLoading(false);
            return;
        }

        const result = await getLureAdviceAction({
            species: selectedSpecies,
            lureFamily: lure,
            dayContext: currentDayContext,
            currentHour: currentHour,
            recentWindow: weatherData.recent,
        });

        if (result.data) {
            setLureAdvice(result.data);
        } else {
            console.error("Lure Advice Error:", result.error);
            setLureAdvice(null);
        }
        
        setIsLureAdviceLoading(false);

    }, [selectedSpecies, weatherData]);


    // Effect 1: Fetch initial weather data for the location
    useEffect(() => {
        async function loadInitialData() {
            setIsWeatherLoading(true);
            try {
                const weather = await getCachedWeatherData(location);
                setWeatherData(weather);
            } catch (error) {
                console.error("Failed to load initial data:", error);
                setForecastError("Could not load weather data for this location.");
            } finally {
                setIsWeatherLoading(false);
            }
        }
        if (location.latitude && location.longitude) {
           loadInitialData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);


    // Effect 2: Load forecast when weather data is available or dependencies change
    useEffect(() => {
        if (weatherData && !isWeatherLoading && user) {
            loadForecast(selectedSpecies, selectedDate, location);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weatherData, isWeatherLoading, selectedSpecies, selectedDate, user]); // `loadForecast` is stable via useCallback
    
    // Effect 3: Load casting and lure advice when dependencies are ready
    useEffect(() => {
        if (!isForecastLoading && dayContext && threeHourScores.length > 0) {
            loadCastingAdvice(selectedLure, dayContext, threeHourScores);
            loadLureAdvice(selectedLure, dayContext);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isForecastLoading, selectedLure, dayContext, threeHourScores]);

    const handleToggleFavorite = async () => {
        if (!user || !spot.isUserSpot || !spot.id) {
            toast({
                variant: 'destructive',
                title: 'Cannot favorite this spot',
                description: 'Only custom-added spots can be marked as favorites.',
            });
            return;
        }
        
        const originalIsFavorite = spot.isFavorite;

        // Optimistic update
        setSpot((prev: any) => ({ ...prev, isFavorite: !prev.isFavorite }));
        setAllAvailableSpots(prevSpots => prevSpots.map(s => 
            s.id === spot.id ? { ...s, isFavorite: !s.isFavorite } : s
        ));

        const { success, error } = await toggleFavoriteSpotAction({
            userId: user.uid,
            spotId: spot.id,
            isFavorite: originalIsFavorite,
        });

        if (error) {
            // Revert on error
            setSpot((prev: any) => ({ ...prev, isFavorite: originalIsFavorite }));
            setAllAvailableSpots(prevSpots => prevSpots.map(s => 
                s.id === spot.id ? { ...s, isFavorite: originalIsFavorite } : s
            ));
            toast({
                variant: 'destructive',
                title: 'Failed to update favorite',
                description: error,
            });
        } else {
             toast({
                variant: 'success',
                title: originalIsFavorite ? 'Removed from favorites' : 'Added to favorites',
            });
        }
    };


  return (
    <>
      <SpotHeaderCard spot={spot} onToggleFavorite={handleToggleFavorite} />
                
      <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="casting">Casting</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forecast" className="space-y-4 pt-4">
            <ForecastTab
              isWeatherLoading={isWeatherLoading}
              weatherData={weatherData}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              isForecastLoading={isForecastLoading}
              forecastError={forecastError}
              threeHourScores={threeHourScores}
              overallDayScore={overallDayScore}
              spotName={spot.name}
              selectedSpecies={selectedSpecies}
              onSelectSpecies={setSelectedSpecies}
              recommendedWindow={recommendedWindow}
              dayContext={dayContext}
              location={location}
            />
          </TabsContent>

           <TabsContent value="casting" className="space-y-4 pt-4">
              <CastingTab
                isLureAdviceLoading={isLureAdviceLoading}
                isForecastLoading={isForecastLoading}
                lureAdvice={lureAdvice}
                isAdviceLoading={isAdviceLoading}
                advice={advice}
                selectedLure={selectedLure}
                onLureSelect={setSelectedLure}
              />
          </TabsContent>
          
          <TabsContent value="practice" className="pt-4 space-y-4">
             <ProgressTab isInsideSpotDetails />
          </TabsContent>

          <TabsContent value="gallery" className="pt-4 space-y-4">
            <GalleryTab spot={spot} />
          </TabsContent>

      </Tabs>
    </>
  );
}

export default function SpotDetailsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-4 pb-8">
        <Suspense fallback={<Skeleton className="w-full h-screen" />}>
          <SpotDetailsContent />
        </Suspense>
      </main>
    </div>
  );
}
