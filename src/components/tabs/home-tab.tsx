'use client';

import { Header } from '@/components/header';
import { PlacesSearch } from '@/components/places-search';
import { useState, useEffect } from 'react';
import type { Location, WeatherApiResponse } from '@/lib/types';
import { getCachedWeatherData } from '@/services/weather/client';
import { ConditionsPanel } from '@/components/conditions-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { TodaysChancesCard } from '../todays-chances-card';
import { GreetingBlock } from '../home/greeting-block';
import { MyLocations } from '../home/my-locations';
import { isToday } from 'date-fns';

export function HomeTab() {
  const { user, isInitialized, isLoading } = useUser();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/welcome');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: Location = {
            name: "Current Location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(userLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
          const defaultLocation: Location = {
            name: "Gaborone Dam",
            latitude: -24.718299,
            longitude: 25.907478
          };
          setLocation(defaultLocation);
        }
      );
    } else {
      const defaultLocation: Location = {
            name: "Gaborone Dam",
            latitude: -24.718299,
            longitude: 25.907478
          };
      setLocation(defaultLocation);
    }
  }, []);

  useEffect(() => {
    if (location) {
      const loadWeather = async () => {
        setIsWeatherLoading(true);
        try {
          const data = await getCachedWeatherData(location);
          setWeather(data);
        } catch (error) {
          console.error("Failed to load weather for homepage", error);
          setWeather(null);
        } finally {
          setIsWeatherLoading(false);
        }
      };
      loadWeather();
    }
  }, [location]);

  if (!isInitialized || isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Skeleton className="h-screen w-screen" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 space-y-4 p-4 pb-24 overflow-y-auto">
        <GreetingBlock />
        <PlacesSearch />

        <div className="pt-2">
            {isWeatherLoading || !weather || !location ? (
                <Skeleton className="h-[280px] w-full rounded-xl" />
            ) : isToday(selectedDate) ? (
                <TodaysChancesCard weatherData={weather} location={location} />
            ) : (
                 <Skeleton className="h-[280px] w-full rounded-xl" />
            )}
        </div>
        
        <div className="pt-2">
            {isWeatherLoading || !weather || !location ? (
                <Skeleton className="h-[180px] w-full rounded-xl" />
            ) : (
                <ConditionsPanel location={location} initialData={weather} />
            )}
        </div>
        
        <MyLocations />
      </main>
    </>
  );
}
