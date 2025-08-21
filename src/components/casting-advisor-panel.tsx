
'use client';

import React from 'react';
import type { ScoreStatus } from "@/lib/types";
import type { CastingAdviceOutput } from '@/ai/flows/casting-advice-flow';
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from '@/lib/utils';
import { SpotBankIcon } from './icons/spot-bank';
import { SpotCoverIcon } from './icons/spot-cover';
import { SpotDropOffIcon } from './icons/spot-drop-off';
import { SpotFlatIcon } from './icons/spot-flat';
import { SpotInflowIcon } from './icons/spot-inflow';
import { SpotPointIcon } from './icons/spot-point';
import { Fish } from 'lucide-react';

const SPOT_ICONS: Record<string, React.FC<any>> = {
    "Drop-offs": SpotDropOffIcon,
    "Weed Beds": SpotFlatIcon,
    "Windward Bank": SpotBankIcon,
    "Points": SpotPointIcon,
    "Sunken Cover": SpotCoverIcon,
    "Creek Mouths": SpotInflowIcon,
    "default": SpotBankIcon,
};

const getIconForSpot = (spotName: string): React.FC<any> => {
    const keywords: Record<string, React.FC<any>> = {
        "drop-off": SpotDropOffIcon,
        "flat": SpotFlatIcon,
        "weed": SpotFlatIcon,
        "bank": SpotBankIcon,
        "point": SpotPointIcon,
        "cover": SpotCoverIcon,
        "shade": SpotCoverIcon,
        "inflow": SpotInflowIcon,
        "creek": SpotInflowIcon,
        "seam": SpotInflowIcon,
        "structure": SpotCoverIcon,
        "transition": SpotBankIcon,
    };

    const lowerCaseName = spotName.toLowerCase();
    for (const keyword in keywords) {
        if (lowerCaseName.includes(keyword)) {
            return keywords[keyword];
        }
    }
    return SPOT_ICONS["default"];
};


const statusColors: Record<ScoreStatus, string> = {
    "Prime": "text-score-prime",
    "Very Good": "text-score-very-good",
    "Good": "text-score-good",
    "Fair": "text-score-fair",
    "Fair-Slow": "text-score-fair-slow",
    "Poor": "text-score-poor",
    "Very Poor": "text-score-very-poor",
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

    const { where_to_cast, how_to_fish } = advice;

    // Take the top 6 spots for the grid display
    const topSpots = where_to_cast.ranked_spots.slice(0, 6);

    return (
        <Card className="w-full rounded-xl shadow-card border-0 p-4 space-y-4 gradient-fishing-panel text-white">
            <div>
                <h3 className="font-headline text-lg">Where to Cast</h3>
                <p className="text-white/80 text-sm mt-1">{where_to_cast.summary}</p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                    {topSpots.map(spot => {
                        const Icon = getIconForSpot(spot.name);
                        return (
                            <div key={spot.name} className="bg-white/15 rounded-lg p-2 text-center flex flex-col items-center justify-center aspect-square">
                                <Icon className="w-6 h-6 text-white/90" />
                                <span className="font-headline font-bold text-xl mt-1">{spot.score}</span>
                                <span className="text-[11px] leading-tight font-medium text-white/80">{spot.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-white/20 pt-4">
                <h3 className="font-headline text-lg">How to Fish</h3>
                <p className="text-white/80 text-sm mt-1 mb-3">{how_to_fish.summary}</p>
                <div className="space-y-2">
                    {how_to_fish.techniques.map(tech => (
                        <div key={tech.name} className="flex gap-3 items-start">
                            <div className="w-5 h-5 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                               <Fish className="w-3 h-3 text-white/80" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm leading-tight">{tech.name}</h4>
                                <p className="text-xs text-white/70 leading-snug">{tech.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
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
                 <div className="grid grid-cols-3 gap-2 pt-2">
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="w-full aspect-square rounded-lg" />
                 </div>
             </div>
              <div className="space-y-2 pt-4 border-t">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-full" />
                 <div className="space-y-3 mt-2">
                    <div className="flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                     <div className="flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                 </div>
             </div>
        </Card>
    );
}
