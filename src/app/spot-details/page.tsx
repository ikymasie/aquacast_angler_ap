
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import type { Species, Location, WeatherApiResponse, ThreeHourIntervalScore, OverallDayScore, RecommendedWindow, ScoredHour, LureFamily, DayContext } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction, getCastingAdviceAction, getLureAdviceAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { SpeciesSelector } from '@/components/species-selector';
import { RecommendedTimeCard } from '@/components/recommended-time-card';
import { DaySelector } from '@/components/day-selector';
import { startOfToday, isFuture, parseISO, format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DaypartScorePanel } from '@/components/daypart-score-panel';
import { recommendWindows } from '@/lib/scoring';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CastingAdvisorPanel } from '@/components/casting-advisor-panel';
import { QuickMetricsPanel } from '@/components/quick-metrics-panel';
import { LureSelector } from '@/components/lure-selector';
import type { CastingAdviceInput, CastingAdviceOutput } from '@/ai/flows/casting-advice-flow';
import { CastingConditionsCard } from '@/components/casting-conditions-card';
import type { LureAdviceInput, LureAdviceOutput } from '@/ai/flows/lure-advice-flow';


// Find a spot by name, or return the first one as a fallback.
function getSpotByName(name?: string | null) {
  if (!name) return allSpotsData[0];
  // Handle user-added spots from localStorage
  if (typeof window !== 'undefined') {
      const userSpots = JSON.parse(localStorage.getItem('user-spots') || '[]');
      const userSpot = userSpots.find((s: any) => s.name === name);
      if (userSpot) return userSpot;
  }
  const spot = allSpotsData.find(s => s.name === name);
  return spot || allSpotsData[0];
}

export default function SpotDetailsPage() {
    const searchParams = useSearchParams();
    const spotName = searchParams.get('name');
    const [spot, setSpot] = useState(() => getSpotByName(spotName));
    
    // Forecast state
    const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bream');
    const [selectedDate, setSelectedDate] = useState(startOfToday());
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
        setIsForecastLoading(true);
        setForecastError(null);
        
        const forecastResult = await getFishingForecastAction({
            species: species,
            location: loc,
            date: date.toISOString(),
        });

        if (forecastResult.data) {
             const allScoredHours: ScoredHour[] = (forecastResult.data.hourlyChartData || []).map((d: any) => {
                // Find corresponding full hour data point, safer than time string matching
                 if (!weatherData) return null;
                const correspondingHour = weatherData.hourly.find(h => h.t.startsWith(format(date, 'yyyy-MM-dd')) && format(parseISO(h.t), 'ha') === d.time);
                return {
                    time: correspondingHour?.t || new Date().toISOString(),
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
             console.error("Forecast Error:", forecastResult.error);
             setForecastError(forecastResult.error);
             setRecommendedWindow(null);
             setThreeHourScores([]);
             setOverallDayScore(null);
        }

        setIsForecastLoading(false);
    }, [weatherData]);

    const loadCastingAdvice = useCallback(async (lure: LureFamily, currentDayContext: DayContext, currentThreeHourScores: ThreeHourIntervalScore[]) => {
        if (!currentDayContext || !currentThreeHourScores.length) return;

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
        } else {
            console.error("Advice Error:", result.error);
            setAdvice(null);
        }
        setIsAdviceLoading(false);
    }, [selectedSpecies, location]);

    const loadLureAdvice = useCallback(async (lure: LureFamily, currentDayContext: DayContext) => {
        if (!currentDayContext || !weatherData) return;
        setIsLureAdviceLoading(true);

        const now = new Date();
        const currentHour = weatherData.hourly.find(h => isFuture(parseISO(h.t)) || format(parseISO(h.t), 'yyyy-MM-dd-HH') === format(now, 'yyyy-MM-dd-HH'));
        
        if (!currentHour) {
            setIsLureAdviceLoading(false);
            return;
        }

        const payload: LureAdviceInput = {
            species: selectedSpecies,
            lureFamily: lure,
            dayContext: currentDayContext,
            currentHour: currentHour,
            recentWindow: weatherData.recent,
        }
        
        const result = await getLureAdviceAction(payload);
        if (result.data) {
            setLureAdvice(result.data);
        } else {
            console.error("Lure Advice Error:", result.error);
            setLureAdvice(null);
        }
        
        setIsLureAdviceLoading(false);

    }, [selectedSpecies, weatherData]);


    // Effect 1: Fetch initial weather data for the location, then chain forecast loading
    useEffect(() => {
        async function loadInitialData() {
            setIsWeatherLoading(true);
            try {
                const weather = await getCachedWeatherData(location);
                setWeatherData(weather);
                
                // Now that weather is confirmed, set a valid date and load forecast
                const initialDate = startOfToday();
                setSelectedDate(initialDate); // Ensure we start with today
                await loadForecast(selectedSpecies, initialDate, location);

            } catch (error) {
                console.error("Failed to load initial data:", error);
                setForecastError("Could not load weather data for this location.");
            } finally {
                setIsWeatherLoading(false);
            }
        }
        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]); // Only runs when location changes


    // Effect 2: Reload forecast when species or date change, if weather data is present
    useEffect(() => {
        if (weatherData && !isWeatherLoading) {
            loadForecast(selectedSpecies, selectedDate, location);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSpecies, selectedDate]);
    
    // Effect 3: Load casting advice when its dependencies are ready
    useEffect(() => {
        if (!isForecastLoading && dayContext && threeHourScores.length > 0) {
            loadCastingAdvice(selectedLure, dayContext, threeHourScores);
            loadLureAdvice(selectedLure, dayContext);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isForecastLoading, selectedLure, dayContext]); // Simplified dependencies


     const mapThumbnails = [
        { id: 'map', imageUrl: 'https://placehold.co/100x100.png?text=Map', hint: 'map view' },
        { id: 'photo1', imageUrl: 'https://placehold.co/100x100.png', hint: 'fishing spot photo' },
        { id: 'photo2', imageUrl: 'https://placehold.co/100x100.png', hint: 'lake view' },
    ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <Header/>
        <main className="flex-1 p-4 md:p-6 space-y-4 pb-8">
            <Suspense fallback={<Skeleton className="w-full h-screen" />}>
                <SpotHeaderCard spot={spot} />
                
                <Tabs defaultValue="forecast" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="forecast">Forecast</TabsTrigger>
                        <TabsTrigger value="advisor">Casting Advisor</TabsTrigger>
                        <TabsTrigger value="map">Map & Photos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="forecast" className="space-y-4 pt-4">
                        {isWeatherLoading || !weatherData ? (
                            <Skeleton className="h-12 w-full" />
                        ) : (
                            <DaySelector 
                                dailyData={weatherData.daily}
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />
                        )}
                        
                        {isForecastLoading ? (
                           <Skeleton className="h-[180px] w-full rounded-xl" />
                        ) : forecastError ? (
                           <Card className="h-[180px] w-full rounded-xl bg-destructive/10 border-destructive/50 flex items-center justify-center p-4">
                               <p className="text-center text-destructive-foreground">{forecastError}</p>
                           </Card>
                        ) : (threeHourScores.length > 0 && overallDayScore) ? (
                           <DaypartScorePanel
                               speciesKey={selectedSpecies.toLowerCase() as any}
                               spotName={spot.name}
                               dayAvgScore={overallDayScore.dayAvgScore}
                               dayStatus={overallDayScore.dayStatus}
                               intervals={threeHourScores}
                           />
                        ) : (
                           <Card className="h-[180px] w-full rounded-xl bg-secondary/50 flex items-center justify-center p-4">
                               <p className="text-center text-muted-foreground">Not enough data for a full day summary. Check again later.</p>
                           </Card>
                        )}
                        
                        <SpeciesSelector 
                           selectedSpecies={selectedSpecies}
                           onSelectSpecies={setSelectedSpecies}
                           disabled={isForecastLoading}
                        />

                        {isForecastLoading ? (
                            <Skeleton className="h-[88px] w-full rounded-xl" />
                        ) : recommendedWindow ? (
                            <RecommendedTimeCard window={recommendedWindow} />
                        ) : null }

                        {isWeatherLoading ? (
                            <Skeleton className="h-20 w-full rounded-xl" />
                        ) : weatherData && dayContext ? (
                            <QuickMetricsPanel 
                                dayContext={dayContext}
                                recentWindow={weatherData.recent}
                            />
                        ) : null}
                    </TabsContent>

                     <TabsContent value="advisor" className="space-y-4 pt-4">
                        <CastingConditionsCard 
                            isLoading={isLureAdviceLoading || isForecastLoading}
                            advice={lureAdvice}
                        />
                        <LureSelector 
                            selectedLure={selectedLure}
                            onLureSelect={setSelectedLure}
                            disabled={isAdviceLoading || isForecastLoading || isLureAdviceLoading}
                        />
                        <CastingAdvisorPanel 
                            isLoading={isAdviceLoading || isForecastLoading}
                            advice={advice}
                        />
                    </TabsContent>

                    <TabsContent value="map" className="pt-4">
                        <MapCard
                           center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lon }}
                           thumbnails={mapThumbnails}
                       />
                    </TabsContent>
                </Tabs>
            </Suspense>
        </main>
    </div>
  );
}

    