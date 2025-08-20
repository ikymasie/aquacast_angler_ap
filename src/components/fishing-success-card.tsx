'use client';

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SpeciesSelector } from "@/components/species-selector";
import { getFishingForecastAction } from "@/app/actions";
import type { Species } from "@/lib/types";
import { MOCK_LOCATION } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


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
    if (isPending && !result) return { bgColor: 'bg-muted', textColor: 'text-muted-foreground', label: 'Loading...'};
    if (score >= 80) return { bgColor: 'bg-good', textColor: 'text-white', label: 'Excellent'};
    if (score >= 60) return { bgColor: 'bg-good', textColor: 'text-white', label: 'Good'};
    if (score >= 40) return { bgColor: 'bg-fair', textColor: 'text-ink-900', label: 'Fair'};
    return { bgColor: 'bg-poor', textColor: 'text-white', label: 'Poor'};
  }

  const { bgColor, textColor, label } = getScoreInfo();

  return (
    <Card className="w-full shadow-card rounded-xl overflow-hidden border-0">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="font-headline text-h2 text-ink-900">
              Fishing Success Score
            </CardTitle>
            <CardDescription className="text-body text-ink-500">
              {MOCK_LOCATION.name}
            </CardDescription>
          </CardHeader>
          <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} disabled={isPending} />
          
          <div className="pt-4">
            {isPending && !result ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                 <Skeleton className="h-5 w-1/2" />
              </div>
            ) : error ? (
              <div className="text-destructive font-medium">
                <p>Could not load recommendation: {error}</p>
              </div>
            ) : result ? (
              <RecommendedWindowCard timeWindow={result.recommendedTimeWindow} score={score} />
            ) : null}
          </div>
        </div>

        <div className={cn("flex items-center justify-center p-6 text-white gradient-fishing-panel", bgColor)}>
            <div className="relative text-center space-y-2">
                {isPending && !result ? (
                  <Skeleton className="h-12 w-24 mx-auto bg-white/20" />
                ) : (
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-headline font-bold text-numeric-xl">
                      {result ? Math.round(result.successScore) : '--'}
                    </span>
                    <span className="font-headline font-bold text-h2">%</span>
                  </div>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white text-sm rounded-full border-0">
                  {label}
                </Badge>
            </div>
        </div>
      </div>
    </Card>
  );
}


function RecommendedWindowCard({ timeWindow, score }: { timeWindow: string, score: number }) {
  const scoreInfo = 
    score >= 80 ? { label: 'EXCELLENT', className: 'bg-good/10 text-good' } :
    score >= 60 ? { label: 'GOOD', className: 'bg-good/10 text-good' } :
    score >= 40 ? { label: 'FAIR', className: 'bg-fair/20 text-fair' } :
    { label: 'POOR', className: 'bg-poor/10 text-poor' };

  // Handle case where timeWindow is undefined or not a parsable string
  const hasWindow = timeWindow && timeWindow.includes('-');
  
  return (
    <div className="p-4 rounded-xl bg-card border shadow-inner-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-caption text-ink-500 font-medium">Recommended Window</p>
                <p className="font-headline text-numeric-l text-ink-700">{timeWindow || 'No recommendation available.'}</p>
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
