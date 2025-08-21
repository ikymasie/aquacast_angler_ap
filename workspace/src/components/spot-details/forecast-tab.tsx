
'use client';

import { DaySelector } from '@/components/day-selector';
import { SpeciesSelector } from '@/components/species-selector';
import { DaypartScorePanel } from '@/components/daypart-score-panel';
import { RecommendedTimeCard } from '@/components/recommended-time-card';
import { QuickMetricsPanel } from '@/components/quick-metrics-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import type { WeatherApiResponse, DayContext, ThreeHourIntervalScore, OverallDayScore, Species, RecommendedWindow } from '@/lib/types';

interface ForecastTabProps {
    isWeatherLoading: boolean;
    weatherData: WeatherApiResponse | null;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    isForecastLoading: boolean;
    forecastError: string | null;
    threeHourScores: ThreeHourIntervalScore[];
    overallDayScore: OverallDayScore | null;
    spotName: string;
    selectedSpecies: Species;
    onSelectSpecies: (species: Species) => void;
    recommendedWindow: RecommendedWindow | null;
    dayContext: DayContext | undefined;
}

export function ForecastTab({
    isWeatherLoading,
    weatherData,
    selectedDate,
    onDateSelect,
    isForecastLoading,
    forecastError,
    threeHourScores,
    overallDayScore,
    spotName,
    selectedSpecies,
    onSelectSpecies,
    recommendedWindow,
    dayContext,
}: ForecastTabProps) {
    return (
        <>
            {isWeatherLoading || !weatherData ? (
                <Skeleton className="h-12 w-full" />
            ) : (
                <DaySelector 
                    dailyData={weatherData.daily}
                    selectedDate={selectedDate}
                    onDateSelect={onDateSelect}
                />
            )}
            
            {isForecastLoading ? (
               <Skeleton className="h-[180px] w-full rounded-xl" />
            ) : forecastError ? (
               <Card className="h-[180px] w-full rounded-xl bg-destructive/10 border-destructive/50 flex items-center justify-center p-4">
                   <p className="text-center text-destructive-foreground">{forecastError}</p>
               </Card>
            ) : (threeHourScores.length > 0 && overallDayScore) ? (
               <DaypartScorePanel
                   speciesKey={selectedSpecies.toLowerCase() as any}
                   spotName={spotName}
                   dayAvgScore={overallDayScore.dayAvgScore}
                   dayStatus={overallDayScore.dayStatus}
                   intervals={threeHourScores}
                   selectedDate={selectedDate}
               />
            ) : (
               <Card className="h-[180px] w-full rounded-xl bg-secondary/50 flex items-center justify-center p-4">
                   <p className="text-center text-muted-foreground">Not enough data for a full day summary. Check again later.</p>
               </Card>
            )}
            
            <SpeciesSelector 
               selectedSpecies={selectedSpecies}
               onSelectSpecies={onSelectSpecies}
               disabled={isForecastLoading}
            />

            {isForecastLoading ? (
                <Skeleton className="h-[88px] w-full rounded-xl" />
            ) : recommendedWindow ? (
                <RecommendedTimeCard window={recommendedWindow} />
            ) : null }

            {isWeatherLoading ? (
                <Skeleton className="h-20 w-full rounded-xl" />
            ) : weatherData && dayContext ? (
                <QuickMetricsPanel 
                    dayContext={dayContext}
                    recentWindow={weatherData.recent}
                />
            ) : null}
        </>
    );
}
