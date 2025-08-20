
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import type { Species, Location, WeatherApiResponse, ThreeHourIntervalScore, OverallDayScore, RecommendedWindow, HourlyForecastData } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { SpeciesSelector } from '@/components/species-selector';
import { RecommendedTimeCard } from '@/components/recommended-time-card';
import { DaySelector } from '@/components/day-selector';
import { format, startOfToday } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DaypartScorePanel } from '@/components/daypart-score-panel';
import { recommendWindows } from '@/lib/scoring';
import { ScoredHour } from '@/lib/types';

// Find a spot by name, or return the first one as a fallback.
function getSpotByName(name?: string | null) {
  if (!name) return allSpotsData[0];
  const spot = allSpotsData.find(s => s.name === name);
  return spot || allSpotsData[0];
}

export default function SpotDetailsPage() {
    const [spot, setSpot] = useState(getSpotByName()); // Example spot
    const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bream');
    const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
    const [recommendedWindow, setRecommendedWindow] = useState<RecommendedWindow | null>(null);
    const [threeHourScores, setThreeHourScores] = useState<ThreeHourIntervalScore[] | null>(null);
    const [overallDayScore, setOverallDayScore] = useState<OverallDayScore | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isForecastLoading, setIsForecastLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(startOfToday());

    const location = useMemo(() => ({
        name: spot.name,
        latitude: spot.coordinates.lat,
        longitude: spot.coordinates.lon,
    }), [spot.name, spot.coordinates.lat, spot.coordinates.lon]);

    useEffect(() => {
        async function loadWeather() {
            setIsLoading(true);
            const weather = await getCachedWeatherData(location);
            setWeatherData(weather);
            setIsLoading(false);
        }
        loadWeather();
    }, [location]);

    useEffect(() => {
        async function loadForecast() {
            if (!weatherData) return;
            setIsForecastLoading(true);
            const forecastResult = await getFishingForecastAction({
                species: selectedSpecies,
                location: location,
                date: selectedDate.toISOString(),
            });

            if (forecastResult.data) {
                 // We need to calculate the recommended window on the client from hourly data
                const scoredHours: ScoredHour[] = forecastResult.data.hourlyChartData.map((h: any) => ({
                    time: h.time, // This is just a label 'ha', need full date for recommendWindows
                    score: h.success,
                    condition: h.condition,
                    temperature: h.temperature,
                }));
                
                // The above mapping is problematic. recommendWindows needs full date strings.
                // Let's assume for now the server action will provide what's needed or we get it from weatherData
                const now = new Date();
                const detailedScoredHours = weatherData.hourly
                    .filter(h => new Date(h.t) >= now) // Only future hours
                    .map((h, index) => ({
                        time: h.t,
                        score: forecastResult.data?.hourlyChartData[index]?.success || 0,
                        condition: forecastResult.data?.hourlyChartData[index]?.condition || 'Clear',
                        temperature: forecastResult.data?.hourlyChartData[index]?.temperature || 0,
                    }));

                const recWindow = await recommendWindows(detailedScoredHours);
                setRecommendedWindow(recWindow);

                setThreeHourScores(forecastResult.data.threeHourScores || null);
                setOverallDayScore(forecastResult.data.overallDayScore || null);
            } else {
                setRecommendedWindow(null);
                setThreeHourScores(null);
                setOverallDayScore(null);
            }
            setIsForecastLoading(false);
        }
        loadForecast();
    }, [location, selectedSpecies, weatherData, selectedDate]);


     const mapThumbnails = [
        { id: 'map', imageUrl: 'https://placehold.co/100x100.png?text=Map', hint: 'map view' },
        { id: 'photo1', imageUrl: 'https://placehold.co/100x100.png', hint: 'fishing spot photo' },
        { id: 'photo2', imageUrl: 'https://placehold.co/100x100.png', hint: 'lake view' },
    ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <Header/>
        <main className="flex-1 p-4 md:p-6 space-y-4 pb-24">
            <Suspense fallback={<Skeleton className="w-full h-screen" />}>
                <SpotHeaderCard
                    spot={spot}
                />
                
                <Tabs defaultValue="forecast" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="forecast">Forecast</TabsTrigger>
                        <TabsTrigger value="map">Map</TabsTrigger>
                    </TabsList>
                    <TabsContent value="forecast" className="space-y-4 pt-4">
                        {isLoading || !weatherData ? (
                            <Skeleton className="h-12 w-full" />
                        ) : (
                            <DaySelector 
                                dailyData={weatherData.daily}
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />
                        )}

                        {isForecastLoading || !threeHourScores || !overallDayScore ? (
                           <Skeleton className="h-[180px] w-full rounded-xl" />
                        ) : (
                           <DaypartScorePanel
                               speciesKey={selectedSpecies.toLowerCase() as any}
                               spotName={spot.name}
                               dayAvgScore={overallDayScore.dayAvgScore}
                               dayStatus={overallDayScore.dayStatus}
                               intervals={threeHourScores}
                           />
                        )}

                       <div className="pt-3 space-y-3">
                           <SpeciesSelector 
                               selectedSpecies={selectedSpecies}
                               onSelectSpecies={setSelectedSpecies}
                               disabled={isForecastLoading}
                           />
                            {isForecastLoading || !recommendedWindow ? (
                                <Skeleton className="h-[88px] w-full rounded-xl" />
                            ) : (
                                <RecommendedTimeCard window={recommendedWindow} />
                            )}
                       </div>
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
        <BottomNav />
    </div>
  );
}
