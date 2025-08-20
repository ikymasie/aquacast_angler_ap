
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import { SpeciesVerticalSelector } from '@/components/species-vertical-selector';
import type { Species, Location, WeatherApiResponse, ScoredHour, DaypartScore } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { SearchBar } from '@/components/search-bar';
import { getCachedWeatherData } from '@/services/weather/client';
import { getFishingForecastAction } from '../actions';
import { MOCK_LOCATION } from '@/lib/types';
import { DaypartScorecard } from '@/components/daypart-scorecard';

// Find a spot by name, or return the first one as a fallback.
function getSpotByName(name?: string | null) {
  if (!name) return allSpotsData[0];
  const spot = allSpotsData.find(s => s.name === name);
  return spot || allSpotsData[0];
}

export default function SpotDetailsPage() {
    const [spot, setSpot] = useState(getSpotByName()); // Example spot
    const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
    const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
    const [forecast, setForecast] = useState<{ hourly: ScoredHour[] } | null>(null);
    const [daypartScores, setDaypartScores] = useState<DaypartScore[]>([]);

    useEffect(() => {
        // In a real app, you'd get the spot name from the URL query params
        // For now, we use a default spot.
        const defaultSpotLocation = {
            name: spot.name,
            latitude: spot.coordinates.lat,
            longitude: spot.coordinates.lon,
        };

        async function loadData() {
            const weather = await getCachedWeatherData(defaultSpotLocation);
            setWeatherData(weather);

            const forecastResult = await getFishingForecastAction({
                species: selectedSpecies,
                location: defaultSpotLocation,
            });

            if (forecastResult.data) {
                setForecast({ hourly: forecastResult.data.hourlyChartData.map(h => ({ time: h.time, score: h.success})) });
                setDaypartScores(forecastResult.data.daypartScores);
            }
        }

        loadData();
    }, [spot, selectedSpecies]);


    const speciesList = [
        { id: 'Bass', name: 'Bass', imageUrl: '/icons/fish-bass-solid.svg' },
        { id: 'Bream', name: 'Bream', imageUrl: '/icons/fish-bream-solid.svg' },
        { id: 'Carp', name: 'Carp', imageUrl: '/icons/fish-carp-solid.svg' },
    ];
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
                    weatherData={weatherData}
                    location={{ name: spot.name, latitude: spot.coordinates.lat, longitude: spot.coordinates.lon }}
                />

                {weatherData && forecast && (
                    <DaypartScorecard
                        speciesKey={selectedSpecies.toLowerCase() as any}
                        sunriseISO={weatherData.daily.sunrise}
                        sunsetISO={weatherData.daily.sunset}
                        hourly={forecast.hourly}
                        daypartScores={daypartScores}
                    />
                )}

               <div className="flex flex-col md:flex-row gap-3 pt-3">
                   <div className="w-full md:w-[112px]">
                       <SpeciesVerticalSelector
                           items={speciesList}
                           selectedId={selectedSpecies}
                           onSelect={(id) => setSelectedSpecies(id as Species)}
                       />
                   </div>
                   <div className="flex-1">
                       <MapCard
                           center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lon }}
                           thumbnails={mapThumbnails}
                       />
                   </div>
               </div>
            </Suspense>
        </main>
        <BottomNav />
    </div>
  );
}

    