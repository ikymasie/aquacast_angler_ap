'use client';

import { Suspense, useState, useCallback } from 'react';
import { Header } from '@/components/header';
import { FishingSuccessCard } from '@/components/fishing-success-card';
import { CurrentConditionsCard } from '@/components/current-conditions-card';
import { HourlyForecast } from '@/components/hourly-forecast';
import { FavoritesRecents } from '@/components/favorites-recents';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Star, Map, Settings } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { SearchBar } from '@/components/search-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomePage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Home' }} isActive>
                <Home />
                <span className="group-data-[collapsible=icon]:hidden">
                  Home
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Favorites' }}>
                <Star />
                <span className="group-data-[collapsible=icon]:hidden">
                  Favorites
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Maps' }}>
                <Map />
                <span className="group-data-[collapsible=icon]:hidden">
                  Maps
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Settings' }}>
                <Settings />
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1 p-4 md:p-6">
            <div className="space-y-4">
              <div className="mt-3">
                <SearchBar />
              </div>
              <div className="mt-4">
                <FishingSuccessCard />
              </div>
              <div className="mt-4">
                <Tabs defaultValue="all_locations" className="w-full">
                  <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto h-9 rounded-full bg-secondary text-secondary-foreground">
                    <TabsTrigger value="all_locations" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Locations</TabsTrigger>
                    <TabsTrigger value="recents" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Recently</TabsTrigger>
                    <TabsTrigger value="favorites" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Favorites</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all_locations" className="mt-3">
                    <FavoritesRecents />
                  </TabsContent>
                  <TabsContent value="recents" className="mt-3">
                    <FavoritesRecents tab="recents" />
                  </TabsContent>
                  <TabsContent value="favorites" className="mt-3">
                    <FavoritesRecents tab="favorites" />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
