
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import type { Species, Location, WeatherApiResponse, DaypartScore, OverallDayScore, RecommendedWindow } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { SearchBar } from '@/components/search-bar';
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction } from '../actions';
import { DaypartScorePanel } from '@/components/daypart-score-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { SpeciesSelector } from '@/components/species-selector';
import { RecommendedTimeCard } from '@/components/recommended-time-card';
import { DaySelector } from '@/components/day-selector';
import { format, startOfToday } from 'date-fns';

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
    const [successScore, setSuccessScore] = useState<number | null>(null);
    const [recommendedWindow, setRecommendedWindow] = useState<RecommendedWindow | null>(null);
    const [daypartScores, setDaypartScores] = useState<DaypartScore[] | null>(null);
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
                setSuccessScore(forecastResult.data.successScore || null);
                setDaypartScores(forecastResult.data.daypartScores || null);
                setOverallDayScore(forecastResult.data.overallDayScore || null);
                setRecommendedWindow(forecastResult.data.recommendedTimeWindow || null);
            } else {
                setSuccessScore(null);
                setDaypartScores(null);
                setOverallDayScore(null);
                setRecommendedWindow(null);
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
            <Suspense fallback={<div>Loading...</div>}>
                <SearchBar />
                <SpotHeaderCard
                    spot={spot}
                />
                
                {isLoading || !weatherData ? (
                    <Skeleton className="h-12 w-full" />
                ) : (
                    <DaySelector 
                        dailyData={weatherData.daily}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    />
                )}

                {isForecastLoading || !daypartScores || !overallDayScore || successScore === null ? (
                    <Skeleton className="h-[180px] w-full rounded-xl" />
                ) : (
                    <DaypartScorePanel
                        speciesKey={selectedSpecies.toLowerCase() as any}
                        spotName={spot.name}
                        successScore={successScore}
                        overallScore={overallDayScore}
                        dayparts={daypartScores}
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
                   <MapCard
                       center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lon }}
                       thumbnails={mapThumbnails}
                   />
               </div>
            </Suspense>
        </main>
        <BottomNav />
    </div>
  );
}
