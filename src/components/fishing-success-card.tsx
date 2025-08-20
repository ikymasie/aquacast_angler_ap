'use client';

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SpeciesSelector } from "@/components/species-selector";
import { calculateFishingSuccessScoreAction } from "@/app/actions";
import type { Species } from "@/lib/types";
import { MOCK_CURRENT_CONDITIONS, MOCK_LOCATION } from "@/lib/types";

type SuccessScoreResult = {
  successScore: number;
  recommendedTimeWindow: string;
} | null;

export function FishingSuccessCard() {
  const [isPending, startTransition] = useTransition();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
  const [result, setResult] = useState<SuccessScoreResult>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetScore = (species: Species) => {
    startTransition(async () => {
      setError(null);
      const { data, error } = await calculateFishingSuccessScoreAction({
        species,
        location: MOCK_LOCATION,
        conditions: MOCK_CURRENT_CONDITIONS,
      });

      if (error) {
        setError(error);
      }
      if (data) {
        setResult(data);
      }
    });
  };
  
  useEffect(() => {
    handleGetScore(selectedSpecies);
  }, [selectedSpecies]);

  const scoreColorClass = 
    !result || isPending ? 'bg-muted' :
    result.successScore >= 75 ? 'bg-success' :
    result.successScore >= 50 ? 'bg-fair' : 'bg-poor';
  
  const scoreTextColorClass =
    !result || isPending ? 'text-muted-foreground' :
    result.successScore >= 75 ? 'text-green-900' :
    result.successScore >= 50 ? 'text-amber-900' : 'text-red-900';


  return (
    <Card className="w-full shadow-lg border-2 border-primary/20 overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="font-headline text-2xl md:text-3xl tracking-tight">
                Fishing Success Score for {MOCK_LOCATION.name}
              </CardTitle>
              <CardDescription className="text-base">
                Select a species to get a tailored AI-powered forecast.
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
                <div>
                  <h3 className="text-lg font-semibold font-headline text-primary">Recommended Window</h3>
                  <p className="text-lg">{result.recommendedTimeWindow}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className={`relative flex items-center justify-center w-36 h-36 md:w-48 md:h-48 rounded-full transition-colors duration-500 ${scoreColorClass}`}>
                <div className="absolute inset-2 rounded-full bg-background/50 backdrop-blur-sm" />
                <div className="relative text-center">
                  {isPending && !result ? (
                    <Skeleton className="h-12 w-24" />
                  ) : (
                    <span className={`font-headline font-bold text-5xl md:text-6xl ${scoreTextColorClass}`}>
                      {result ? Math.round(result.successScore) : '--'}
                    </span>
                  )}
                  <p className={`font-semibold ${scoreTextColorClass}`}>Success Score</p>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
