
'use client';

import { Header } from '@/components/header';
import { LocationsRail } from '@/components/locations-rail';
import { BottomNav } from '@/components/bottom-nav';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { FavoritesRecents } from '@/components/favorites-recents';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from 'react';


function AppContent() {
  const [activeTab, setActiveTab] = useState("recents");

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location:', position.coords.latitude, position.coords.longitude);
          // You can now use the coordinates to fetch location-specific data
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Handle errors or user denial gracefully
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 space-y-4 p-4 pb-24">
        <GreetingBlock />
        <SearchBar />

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
    return (
        <div>
             <h1 className="font-headline text-h1 font-bold text-ink-900">Hello John</h1>
             <p className="font-body text-body text-ink-700">Here's your personalized fishing forecast.</p>
        </div>
    )
}

export default function HomePage() {
    return (
        <AppContent/>
    );
}
