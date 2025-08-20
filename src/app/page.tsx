import { Header } from "@/components/header";
import { FishingSuccessCard } from "@/components/fishing-success-card";
import { CurrentConditionsCard } from "@/components/current-conditions-card";
import { HourlyForecast } from "@/components/hourly-forecast";
import { ForecastGraphs } from "@/components/forecast-graphs";
import { InteractiveMap } from "@/components/interactive-map";
import { FavoritesRecents } from "@/components/favorites-recents";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <div className="lg:col-span-3 xl:col-span-4">
            <Suspense fallback={<FishingSuccessCardSkeleton />}>
              <FishingSuccessCard />
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
              <ForecastGraphs />
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
      </main>
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
