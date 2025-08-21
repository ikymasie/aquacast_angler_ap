
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import type { Species, Location, WeatherApiResponse, ThreeHourIntervalScore, OverallDayScore, RecommendedWindow, ScoredHour } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { SpeciesSelector } from '@/components/species-selector';
import { RecommendedTimeCard } from '@/components/recommended-time-card';
import { DaySelector } from '@/components/day-selector';
import { startOfToday, isFuture } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DaypartScorePanel } from '@/components/daypart-score-panel';
import { recommendWindows } from '@/lib/scoring';
import { useSearchParams } from 'next/navigation';

// Find a spot by name, or return the first one as a fallback.
function getSpotByName(name?: string | null) {
  if (!name) return allSpotsData[0];
  const spot = allSpotsData.find(s => s.name === name);
  return spot || allSpotsData[0];
}

export default function SpotDetailsPage() {
    const searchParams = useSearchParams();
    const spotName = searchParams.get('name');
    const [spot, setSpot] = useState(() => getSpotByName(spotName));
    const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bream');
    const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
    const [recommendedWindow, setRecommendedWindow] = useState<RecommendedWindow | null>(null);
    const [threeHourScores, setThreeHourScores] = useState<ThreeHourIntervalScore[]>([]);
    const [overallDayScore, setOverallDayScore] = useState<OverallDayScore | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(true);
    const [isForecastLoading, setIsForecastLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [forecastError, setForecastError] = useState<string | null>(null);

    const location = useMemo(() => ({
        name: spot.name,
        latitude: spot.coordinates.lat,
        longitude: spot.coordinates.lon,
    }), [spot.name, spot.coordinates.lat, spot.coordinates.lon]);

    const loadForecast = useCallback(async (species: Species, date: Date, loc: Location) => {
        setIsForecastLoading(true);
        setForecastError(null);
        
        const forecastResult = await getFishingForecastAction({
            species: species,
            location: loc,
            date: date.toISOString(),
        });

        if (forecastResult.data) {
            const allScoredHours: ScoredHour[] = (weatherData?.hourly || []).map((h, i) => ({
                time: h.t,
                score: forecastResult.data.hourlyChartData[i]?.success || 0,
                condition: forecastResult.data.hourlyChartData[i]?.condition || 'Clear',
                temperature: forecastResult.data.hourlyChartData[i]?.temperature || 0
            }));

            const futureScoredHours = allScoredHours.filter(h => isFuture(new Date(h.time)));
            
            const recWindow = await recommendWindows(futureScoredHours);
            setRecommendedWindow(recWindow);
            setThreeHourScores(forecastResult.data.threeHourScores || []);
            setOverallDayScore(forecastResult.data.overallDayScore || null);
        } else {
            console.error("Forecast Error:", forecastResult.error);
            setForecastError(forecastResult.error);
            setRecommendedWindow(null);
            setThreeHourScores([]);
            setOverallDayScore(null);
        }
        setIsForecastLoading(false);
    }, [weatherData?.hourly]);
    
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
            loadForecast(selectedSpecies, selectedDate, location);
        }
    }, [weatherData, isWeatherLoading, selectedSpecies, selectedDate, location, loadForecast]);


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
                <SpotHeaderCard
                    spot={spot}
                />
                
                <Tabs defaultValue="forecast" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="forecast">Forecast</TabsTrigger>
                        <TabsTrigger value="map">Map</TabsTrigger>
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

                        <SpeciesSelector 
                           selectedSpecies={selectedSpecies}
                           onSelectSpecies={setSelectedSpecies}
                           disabled={isForecastLoading}
                        />

                        {isForecastLoading ? (
                           <Skeleton className="h-[180px] w-full rounded-xl" />
                        ) : forecastError ? (
                           <Card className="h-[180px] w-full rounded-xl bg-destructive/10 border-destructive/50 flex items-center justify-center p-4">
                               <p className="text-center text-destructive-foreground">{forecastError}</p>
                           </Card>
                        ) : (
                           <DaypartScorePanel
                               speciesKey={selectedSpecies.toLowerCase() as any}
                               spotName={spot.name}
                               dayAvgScore={overallDayScore?.dayAvgScore ?? 0}
                               dayStatus={overallDayScore?.dayStatus ?? 'Poor'}
                               intervals={threeHourScores}
                           />
                        )}

                       <div className="pt-3 space-y-3">
                           
                            {isForecastLoading ? (
                                <Skeleton className="h-[88px] w-full rounded-xl" />
                            ) : recommendedWindow ? (
                                <RecommendedTimeCard window={recommendedWindow} />
                            ) : null }
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
    </div>
  );
}
