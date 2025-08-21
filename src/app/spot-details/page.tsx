
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import type { Species, Location, WeatherApiResponse, ThreeHourIntervalScore, OverallDayScore, RecommendedWindow, ScoredHour, LureFamily, DayContext } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction, getCastingAdviceAction } from '../actions';
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
        // Find the daily data for the selected day from the 7-day forecast data
        const dayIndex = weatherData.daily.findIndex(d => new Date(d.sunrise).toDateString() === selectedDate.toDateString());
        return weatherData.daily[dayIndex >= 0 ? dayIndex : 0];
    }, [weatherData, selectedDate]);


    const loadForecast = useCallback(async (species: Species, date: Date, loc: Location) => {
        setIsForecastLoading(true);
        setForecastError(null);
        
        const forecastResult = await getFishingForecastAction({
            species: species,
            location: loc,
            date: date.toISOString(),
        });

        if (forecastResult.data && weatherData?.hourly) {
            const allScoredHours: ScoredHour[] = weatherData.hourly.map((h, i) => {
                const correspondingForecast = forecastResult.data.hourlyChartData.find(d => d.time === format(parseISO(h.t), 'ha'));
                return {
                    time: h.t,
                    score: correspondingForecast?.success ?? 0,
                    condition: correspondingForecast?.condition ?? 'Clear',
                    temperature: correspondingForecast?.temperature ?? 0
                };
             });

            const futureScoredHours = allScoredHours.filter(h => isFuture(new Date(h.time)));
            const recWindow = await recommendWindows(futureScoredHours);
            
            setRecommendedWindow(recWindow);
            setThreeHourScores(forecastResult.data.threeHourScores || []);
            setOverallDayScore(forecastResult.data.overallDayScore || null);
            
        } 
        
        if (forecastResult.error) {
            console.error("Forecast Error:", forecastResult.error);
            setForecastError(forecastResult.error);
            // Clear previous results on error
            setRecommendedWindow(null);
            setThreeHourScores([]);
            setOverallDayScore(null);
        }

        setIsForecastLoading(false);
    }, [weatherData?.hourly]);

    const loadCastingAdvice = useCallback(async (lure: LureFamily) => {
        if (!dayContext || !threeHourScores.length) return;

        setIsAdviceLoading(true);
        const payload: CastingAdviceInput = {
            species: selectedSpecies,
            location,
            lureFamily: lure,
            dayContext,
            scoredHours: threeHourScores,
        };
        const result = await getCastingAdviceAction(payload);
        if (result.data) {
            setAdvice(result.data);
        } else {
            console.error("Advice Error:", result.error);
            setAdvice(null);
        }
        setIsAdviceLoading(false);
    }, [dayContext, threeHourScores, selectedSpecies, location]);


    // Initial weather data fetch
    useEffect(() => {
        async function loadWeather() {
            setIsWeatherLoading(true);
            const weather = await getCachedWeatherData(location);
            setWeatherData(weather);
            setIsWeatherLoading(false);
        }
        loadWeather();
    }, [location]);

    // Subsequent forecast calculation when dependencies change
    useEffect(() => {
        if (weatherData && !isWeatherLoading) {
            // --- FIX: Add guardrail to ensure date is valid ---
            const firstForecastDate = parseISO(weatherData.daily[0].sunrise);
            let dateToLoad = selectedDate;

            if (selectedDate < firstForecastDate) {
                console.warn("Selected date is out of forecast range. Resetting to today.");
                dateToLoad = startOfToday();
                setSelectedDate(dateToLoad);
            }
            // --- END FIX ---
            loadForecast(selectedSpecies, dateToLoad, location);
        }
    }, [weatherData, isWeatherLoading, selectedSpecies, selectedDate, location, loadForecast]);

    // Load casting advice when its dependencies are ready
    useEffect(() => {
        if (!isForecastLoading && threeHourScores.length > 0) {
            loadCastingAdvice(selectedLure);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isForecastLoading, threeHourScores, selectedLure]); // only re-run when forecast is loaded or lure changes


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
                        <LureSelector 
                            selectedLure={selectedLure}
                            onLureSelect={setSelectedLure}
                            disabled={isAdviceLoading || isForecastLoading}
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

    