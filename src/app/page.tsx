'use client';

import { Header } from "@/components/header";
import { FishingSuccessCard } from "@/components/fishing-success-card";
import { CurrentConditionsCard } from "@/components/current-conditions-card";
import { HourlyForecast } from "@/components/hourly-forecast";
import { ForecastGraphs } from "@/components/forecast-graphs";
import { InteractiveMap } from "@/components/interactive-map";
import { FavoritesRecents } from "@/components/favorites-recents";
import { Suspense, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Star, Map, Settings } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

export default function HomePage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{children: 'Home'}} isActive>
                <Home />
                <span className="group-data-[collapsible=icon]:hidden">Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{children: 'Favorites'}}>
                <Star />
                <span className="group-data-[collapsible=icon]:hidden">Favorites</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{children: 'Maps'}}>
                <Map />
                <span className="group-data-[collapsible=icon]:hidden">Maps</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{children: 'Settings'}}>
                <Settings />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1 p-4 md:p-6">
            <HomeContent />
          </main>
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


function HomeContent() {
  const [forecastData, setForecastData] = useState<any>(null);

  const handleForecastLoad = useCallback((data: any) => {
    setForecastData(data);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
      <div className="lg:col-span-3 xl:col-span-4">
        <Suspense fallback={<FishingSuccessCardSkeleton />}>
          <FishingSuccessCard onForecastLoad={handleForecastLoad} />
        </Suspense>
      </div>

      <div className="lg:col-span-2 xl:col-span-3 grid gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <CurrentConditionsCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <HourlyForecast />
        </Suspense>
        <Suspense fallback={<CardSkeleton height="h-96" />}>
          <ForecastGraphs hourlyData={forecastData?.hourlyChartData} />
        </Suspense>
      </div>
      
      <div className="lg:col-span-1 xl:col-span-1 grid gap-6">
        <Suspense fallback={<CardSkeleton height="h-64" />}>
          <InteractiveMap />
        </Suspense>
        <Suspense fallback={<CardSkeleton height="h-64" />}>
          <FavoritesRecents />
        </Suspense>
      </div>
    </div>
  );
}


function CardSkeleton({ height = "h-48" }: { height?: string }) {
  return <Skeleton className={`w-full ${height} rounded-xl`} />;
}

function FishingSuccessCardSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
