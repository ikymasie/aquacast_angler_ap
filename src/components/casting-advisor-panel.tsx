
'use client';

import React from 'react';
import type { ScoreStatus } from "@/lib/types";
import type { CastingAdviceOutput } from '@/ai/flows/casting-advice-flow';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from '@/lib/utils';
import { MapPin, Wind, Clock } from 'lucide-react';

const statusColors: Record<ScoreStatus, string> = {
    "Prime": "bg-score-prime text-white",
    "Very Good": "bg-score-very-good text-white",
    "Good": "bg-score-good text-white",
    "Fair": "bg-score-fair text-black",
    "Fair-Slow": "bg-score-fair-slow text-white",
    "Poor": "bg-score-poor text-white",
    "Very Poor": "bg-score-very-poor text-white",
};

interface CastingAdvisorPanelProps {
    isLoading: boolean;
    advice: CastingAdviceOutput | null;
}

export function CastingAdvisorPanel({ isLoading, advice }: CastingAdvisorPanelProps) {

    if (isLoading) {
        return <CastingAdvisorSkeleton />;
    }

    if (!advice) {
        return (
            <Card className="w-full rounded-xl border-dashed border-2 h-[280px] p-4 flex items-center justify-center bg-secondary">
                <p className="text-center font-medium text-muted-foreground">Select a lure to get casting advice.</p>
            </Card>
        );
    }

    const { where_to_cast, how_to_fish, when_to_fish } = advice;

    return (
        <Card className="w-full rounded-xl shadow-card border-0 p-4 space-y-4">
            <div>
                <h3 className="font-headline text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Where to Cast</h3>
                <p className="text-muted-foreground text-sm mt-1">{where_to_cast.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {where_to_cast.ranked_spots.map(spot => (
                        <div key={spot.name} className={cn("p-2 rounded-lg text-sm", statusColors[spot.status])}>
                            <p className="font-bold">{spot.name}</p>
                            <p className="text-xs opacity-90">{spot.reasoning}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="font-headline text-lg flex items-center gap-2"><Wind className="w-5 h-5 text-primary" /> How to Fish</h3>
                <p className="text-muted-foreground text-sm mt-1">{how_to_fish.recommendation}</p>
            </div>
            
            <div className="border-t pt-4">
                <h3 className="font-headline text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> When to Fish</h3>
                <p className="text-muted-foreground text-sm mt-1">{when_to_fish.timing_recommendation}</p>
                 <p className="text-muted-foreground text-xs mt-1 italic">{when_to_fish.reasoning}</p>
            </div>
        </Card>
    );
}


function CastingAdvisorSkeleton() {
    return (
         <Card className="w-full rounded-xl p-4 space-y-4">
             <div className="space-y-2">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-3/4" />
             </div>
              <div className="space-y-2 pt-4 border-t">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-full" />
             </div>
              <div className="space-y-2 pt-4 border-t">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-full" />
             </div>
        </Card>
    );
}
