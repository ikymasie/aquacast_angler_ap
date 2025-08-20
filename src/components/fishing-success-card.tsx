
'use client';

import { useState, useTransition, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SpeciesSelector } from "@/components/species-selector";
import { getFishingForecastAction } from "@/app/actions";
import type { Species } from "@/lib/types";
import { MOCK_LOCATION } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FishBassIcon } from "./icons/fish-bass";
import { FishBreamIcon } from "./icons/fish-bream";
import { FishCarpIcon } from "./icons/fish-carp";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { CurrentConditionsCard } from "./current-conditions-card";
import { HourlyForecast } from "./hourly-forecast";
import { ForecastGraphs } from "./forecast-graphs";

type SuccessScoreResult = {
  successScore: number;
  recommendedTimeWindow: string;
} | null;

const speciesIcons: Record<Species, React.FC<React.SVGProps<SVGSVGElement>>> = {
    Bream: FishBreamIcon,
    Bass: FishBassIcon,
    Carp: FishCarpIcon,
};


export function FishingSuccessCard() {
  const [isPending, startTransition] = useTransition();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
  const [result, setResult] = useState<SuccessScoreResult>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const SpeciesIcon = speciesIcons[selectedSpecies];

  const handleGetScore = useCallback((species: Species) => {
    startTransition(async () => {
      setError(null);
      const { data, error } = await getFishingForecastAction({
        species,
        location: MOCK_LOCATION,
      });

      if (error) {
        setError(error);
        toast({
          variant: 'destructive',
          title: 'Failed to get forecast',
          description: error,
        });
      }
      if (data) {
        setResult({
            successScore: data.successScore,
            recommendedTimeWindow: data.recommendedTimeWindow,
        });
        setForecastData(data);
      }
    });
  }, [toast]);
  
  useEffect(() => {
    handleGetScore(selectedSpecies);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpecies]);

  const score = result?.successScore ?? 0;
  
  const getScoreInfo = () => {
    if (isPending && !result) return { label: 'Loading...', className: 'bg-muted text-muted-foreground' };
    if (score >= 80) return { label: 'Excellent', className: 'bg-good/20 text-good' };
    if (score >= 60) return { label: 'Good', className: 'bg-good/20 text-good' };
    if (score >= 40) return { label: 'Fair', className: 'bg-fair/20 text-fair' };
    return { label: 'Poor', className: 'bg-poor/20 text-poor' };
  }

  const { label, className: badgeClassName } = getScoreInfo();
  
  // Mock factors for UI
  const mockFactors = [
      { label: "Rising Pressure", positive: true },
      { label: "Overcast", positive: true },
      { label: "Wind", positive: false },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="w-full shadow-card rounded-xl overflow-hidden border-0 gradient-fishing-panel text-white">
          <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                  <SpeciesIcon className="w-8 h-8"/>
                  <h3 className="text-h3 font-headline font-semibold">{selectedSpecies} Fishing Success</h3>
              </div>
              
              <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                      {isPending && !result ? (
                          <Skeleton className="h-7 w-20 bg-white/20" />
                      ) : (
                          <>
                              <span className="font-headline font-bold text-numeric-l">
                              {result ? Math.round(result.successScore) : '--'}
                              </span>
                              <span className="font-headline font-bold text-body">%</span>
                          </>
                      )}
                  </div>
                  <Badge className={cn("h-6 rounded-md text-xs", badgeClassName)}>{label}</Badge>
              </div>

              <div className="flex items-center gap-2">
                  {mockFactors.map(factor => (
                      <Badge key={factor.label} variant="secondary" className="h-6 rounded-md bg-white/15 text-white border-0 text-xs">
                          {factor.positive ? <ArrowUp className="w-3 h-3 mr-1.5"/> : <ArrowDown className="w-3 h-3 mr-1.5"/>}
                          {factor.label}
                      </Badge>
                  ))}
              </div>
              
               <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} disabled={isPending} />
          </div>

          <div className="px-2 pb-2">
              { (isPending && !result) ? (
                  <div className="p-4 h-[72px]">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-1/2 mt-2" />
                  </div>
              ) : error ? (
                  <div className="p-4 rounded-xl text-destructive-foreground font-medium bg-destructive/50">
                      <p>Could not load recommendation: {error}</p>
                  </div>
              ) : result ? (
                  <RecommendedWindowCard timeWindow={result.recommendedTimeWindow} score={score} />
              ) : null }
          </div>
      </Card>
      <div className="grid gap-4">
        <CurrentConditionsCard />
        <HourlyForecast />
      </div>
      <div className="lg:col-span-2">
          <ForecastGraphs hourlyData={forecastData?.hourlyChartData} />
      </div>
    </div>
  );
}


function RecommendedWindowCard({ timeWindow, score }: { timeWindow: string, score: number }) {
  const scoreInfo = 
    score >= 80 ? { label: 'EXCELLENT', className: 'bg-good/20 text-good' } :
    score >= 60 ? { label: 'GOOD', className: 'bg-good/20 text-good' } :
    score >= 40 ? { label: 'FAIR', className: 'bg-fair/20 text-fair' } :
    { label: 'POOR', className: 'bg-poor/20 text-poor' };

  const hasWindow = timeWindow && typeof timeWindow === 'string' && timeWindow.includes('-');
  
  return (
    <div className="h-[72px] p-4 rounded-xl bg-card text-card-foreground border shadow-inner flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground"/>
            <div>
                <p className="font-headline text-numeric-l leading-tight">{hasWindow ? timeWindow : 'No ideal window'}</p>
            </div>
        </div>
        {hasWindow && (
          <Badge className={cn("h-6 rounded-md text-xs", scoreInfo.className)}>
            {scoreInfo.label}
          </Badge>
        )}
    </div>
  )
}
