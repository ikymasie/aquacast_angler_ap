'use client';

import { useState, useTransition, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SpeciesSelector } from "@/components/species-selector";
import { getFishingForecastAction } from "@/app/actions";
import type { Species } from "@/lib/types";
import { MOCK_LOCATION, MOCK_CURRENT_CONDITIONS } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Wind } from "lucide-react";
import { format } from "date-fns";

type SuccessScoreResult = {
  successScore: number;
  recommendedTimeWindow: string;
} | null;

export function FishingSuccessCard({ onForecastLoad }: { onForecastLoad: (data: any) => void }) {
  const [isPending, startTransition] = useTransition();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
  const [result, setResult] = useState<SuccessScoreResult>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetScore = (species: Species) => {
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
        onForecastLoad(data);
      }
    });
  };
  
  useEffect(() => {
    handleGetScore(selectedSpecies);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpecies]);

  const score = result?.successScore ?? 0;
  
  const getScoreInfo = () => {
    if (isPending && !result) return { label: 'Loading...'};
    if (score >= 80) return { label: 'Excellent'};
    if (score >= 60) return { label: 'Good'};
    if (score >= 40) return { label: 'Fair'};
    return { label: 'Poor'};
  }

  const { label } = getScoreInfo();
  const today = new Date();

  return (
    <Card className="w-full shadow-card rounded-xl overflow-hidden border-0 gradient-fishing-panel text-white">
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-body opacity-90">{MOCK_CURRENT_CONDITIONS.condition}</p>
                    <p className="text-numeric-xl font-bold">{MOCK_CURRENT_CONDITIONS.temperature}°</p>
                    <p className="text-caption opacity-80">{format(today, 'EEEE, MMMM d')}</p>
                    <div className="flex pt-2">
                         <Badge variant="secondary" className="h-7 rounded-full bg-white/15 text-white border-0">
                            <Wind className="w-4 h-4 mr-2"/>
                            {MOCK_CURRENT_CONDITIONS.windSpeed} km/h
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <div className="text-center space-y-2">
                        {isPending && !result ? (
                          <Skeleton className="h-12 w-24 mx-auto bg-white/20" />
                        ) : (
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="font-headline font-bold text-5xl">
                              {result ? Math.round(result.successScore) : '--'}
                            </span>
                            <span className="font-headline font-bold text-2xl">%</span>
                          </div>
                        )}
                        <Badge variant="secondary" className="bg-white/20 text-sm rounded-full border-0">
                          {label}
                        </Badge>
                    </div>
                </div>
            </div>
             <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} disabled={isPending} />
        </div>

        { (isPending && !result) ? (
            <div className="p-4 border-t border-white/20">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2 mt-2" />
            </div>
        ) : error ? (
             <div className="p-4 border-t border-white/20 text-destructive-foreground font-medium bg-destructive/50">
                <p>Could not load recommendation: {error}</p>
              </div>
        ) : result ? (
             <RecommendedWindowCard timeWindow={result.recommendedTimeWindow} score={score} />
        ) : null }
    </Card>
  );
}


function RecommendedWindowCard({ timeWindow, score }: { timeWindow: string, score: number }) {
    const scoreInfo = 
      score >= 80 ? { label: 'EXCELLENT', className: 'bg-good/20 text-good' } :
      score >= 60 ? { label: 'GOOD', className: 'bg-good/20 text-good' } :
      score >= 40 ? { label: 'FAIR', className: 'bg-fair/20 text-fair' } :
      { label: 'POOR', className: 'bg-poor/20 text-poor' };
  
    const hasWindow = timeWindow && timeWindow.includes('-');
    
    return (
      <div className="p-4 rounded-xl bg-card border shadow-inner-sm">
          <div className="flex items-center justify-between">
              <div>
                  <p className="text-caption text-muted-foreground font-medium">Recommended Window</p>
                  <p className="font-headline text-numeric-l">{hasWindow ? timeWindow : 'No recommendation available.'}</p>
              </div>
              {hasWindow && (
                <Badge className={cn("h-6 rounded-md text-xs", scoreInfo.className)}>
                  {scoreInfo.label}
                </Badge>
              )}
          </div>
      </div>
    )
  }
