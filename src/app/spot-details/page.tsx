
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import type { Species, Location, WeatherApiResponse, DaypartScore, OverallDayScore, RecommendedWindow, HourlyForecastData } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { SpeciesSelector } from '@/components/species-selector';
import { RecommendedTimeCard } from '@/components/recommended-time-card';
import { DaySelector } from '@/components/day-selector';
import { format, startOfToday } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HourlyForecast } from '@/components/hourly-forecast';

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
    const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastData[] | null>(null);
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
                setRecommendedWindow(forecastResult.data.recommendedTimeWindow || null);
                setHourlyForecast(forecastResult.data.hourlyChartData as any || null);
            } else {
                setRecommendedWindow(null);
                setHourlyForecast(null);
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

                        {isForecastLoading || !hourlyForecast ? (
                            <Skeleton className="h-[120px] w-full rounded-xl" />
                        ) : (
                            <HourlyForecast data={hourlyForecast} />
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
