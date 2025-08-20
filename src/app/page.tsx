
'use client';

import { Header } from '@/components/header';
import { ConditionsPanel } from '@/components/conditions-panel';
import { LocationsRail } from '@/components/locations-rail';
import { BottomNav } from '@/components/bottom-nav';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { AquaCastLogo } from '@/components/aqua-cast-logo';
import { FavoritesRecents } from '@/components/favorites-recents';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';

function AppContent() {
  const [activeTab, setActiveTab] = useState("all_spots");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 space-y-4 pb-24"> {/* Add padding to bottom to avoid overlap with nav */}
        <div className="mt-3 space-y-3 px-4">
          <GreetingBlock />
          <SearchBar />
        </div>
        
        <div className="px-4">
          <ConditionsPanel />
        </div>

        <div className="space-y-3">
            <div className="px-4">
                <SectionHeader title="My Locations" />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                  <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto">
                    <TabsTrigger value="all_spots">All Spots</TabsTrigger>
                    <TabsTrigger value="recents">Recents</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  </TabsList>
                </Tabs>
            </div>
            <div className="px-4">
                <FavoritesRecents tab={activeTab as any} />
            </div>
        </div>

        <div className="space-y-3">
          <div className="px-4">
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
             <p className="font-body text-body text-ink-700">It’s a little <span className="text-primary">cloudy</span> today.</p>
             <p className="font-body text-sm text-muted-foreground mt-2">Search for the best fishing spots</p>
        </div>
    )
}

export default function HomePage() {
    return (
        <AppContent/>
    );
}
