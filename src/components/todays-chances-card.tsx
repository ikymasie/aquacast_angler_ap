
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WeatherApiResponse, Location } from '@/lib/types';
import { computeTodaysChances, type TodaysChances } from '@/lib/scoring';
import { DayArc } from './todays-chances/day-arc';
import { ScoreDisplay } from './todays-chances/score-display';
import { RecommendationCard } from './todays-chances/recommendation-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from './ui/button';
import { ChevronDown, Info } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { RecommendedTimeCard } from './recommended-time-card';
import { FactorTiles } from './todays-chances/factor-tiles';

interface TodaysChancesCardProps {
    weatherData: WeatherApiResponse;
    location: Location;
}

export function TodaysChancesCard({ weatherData, location }: TodaysChancesCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [chances, setChances] = useState<TodaysChances | null>(null);

    useEffect(() => {
        if (weatherData && location) {
            const result = computeTodaysChances(weatherData, 'auto');
            setChances(result);
        }
    }, [weatherData, location]);
    
    if (!chances) {
        return <Skeleton className="h-[280px] w-full rounded-xl" />;
    }

    const bestWindow = chances.windows.reduce((best, current) => {
        return (!best || current.score > best.score) ? current : best;
    }, null as any);

    const fallbackWindow = chances.windows.find(w => w.label === "Sunrise") || chances.windows[0] || null;

    const todaysDaily = weatherData.daily.find(d => d.sunrise.startsWith(chances.date));

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card className="w-full rounded-xl shadow-card border-0 p-4 gradient-fishing-panel text-white overflow-hidden">
                <div className="flex justify-between items-center text-white/80 text-sm">
                    <p>{location.name}</p>
                    <p>{chances.date}</p>
                </div>
                
                <div className="flex items-center justify-between gap-2 my-2">
                    <div className="w-1/4">
                       <ScoreDisplay score={chances.todayScore} band={chances.band} />
                    </div>
                    <div className="flex-1">
                       {todaysDaily && <DayArc windows={chances.windows} dailyData={todaysDaily} />}
                    </div>
                </div>

                <div className="mt-2">
                    <RecommendedTimeCard window={bestWindow} fallbackWindow={fallbackWindow} />
                </div>

                <CollapsibleContent className="mt-4 space-y-3">
                     <FactorTiles windows={chances.windows} />
                    <RecommendationCard 
                        recommendations={chances.recommendations}
                        factors={chances.factors}
                    />
                </CollapsibleContent>

                <div className="text-center mt-3 -mb-2">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-8">
                            {isOpen ? 'Show less' : 'Show details'}
                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>
                </div>
            </Card>
        </Collapsible>
    );
}

