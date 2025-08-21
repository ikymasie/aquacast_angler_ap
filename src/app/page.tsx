
'use client';

import { Header } from '@/components/header';
import { LocationsRail } from '@/components/locations-rail';
import { BottomNav } from '@/components/bottom-nav';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { FavoritesRecents } from '@/components/favorites-recents';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from 'react';
import type { Location, WeatherApiResponse } from '@/lib/types';
import { getCachedWeatherData } from '@/services/weather/client';
import { ConditionsPanel } from '@/components/conditions-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { UserAuthDialog } from '@/components/user-auth-dialog';

function AppContent() {
  const [activeTab, setActiveTab] = useState("recents");
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);

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
          // Fallback to a default location if user denies permission
          const defaultLocation: Location = {
            name: "Gaborone Dam",
            latitude: -24.718299,
            longitude: 25.907478
          };
          setLocation(defaultLocation);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 space-y-4 p-4 pb-24">
        <GreetingBlock />
        <SearchBar />

        <div className="pt-2">
            {isWeatherLoading ? (
                <Skeleton className="h-[180px] w-full rounded-xl" />
            ) : location && weather ? (
                <ConditionsPanel location={location} initialData={weather} />
            ) : (
                null // Don't show anything if weather fails to load
            )}
        </div>

        <div className="space-y-3 pt-4">
            <div>
                <SectionHeader title="My Locations" />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                  <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto">
                    <TabsTrigger value="all_spots">All Spots</TabsTrigger>
                    <TabsTrigger value="recents">Recents</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  </TabsList>
                </Tabs>
            </div>
            <div>
                <FavoritesRecents tab={activeTab as any} />
            </div>
        </div>

        <div className="space-y-3">
          <div>
            <SectionHeader title="Popular Locations" />
          </div>
          <LocationsRail />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function GreetingBlock() {
    const { user, isLoading } = useUser();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && user && !user.displayName) {
            setIsAuthDialogOpen(true);
        }
    }, [user, isLoading]);

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>
        )
    }

    return (
        <div>
             <h1 className="font-headline text-h1 font-bold text-ink-900">Hello {user?.displayName || 'Angler'}</h1>
             <p className="font-body text-body text-ink-700">Here's your personalized fishing forecast.</p>
             <UserAuthDialog isOpen={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
        </div>
    )
}

export default function HomePage() {
    return (
        <AppContent/>
    );
}
