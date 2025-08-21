
'use client';

import React, { useMemo } from 'react';
import type { LureFamily, ScoreStatus, RankedSpot, CastingConditions } from "@/lib/types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { cn } from '@/lib/utils';
import { rankCastingSpots } from '@/lib/ranking';

// --- Icons ---
import { LureCrankSwimIcon } from './icons/lure-crank-swim';
import { LureLiveIcon } from './icons/lure-live';
import { LureSoftIcon } from './icons/lure-soft';
import { LureSpinnerIcon } from './icons/lure-spinner';
import { SpotBankIcon } from './icons/spot-bank';
import { SpotCoverIcon } from './icons/spot-cover';
import { SpotDropOffIcon } from './icons/spot-drop-off';
import { SpotFlatIcon } from './icons/spot-flat';
import { SpotInflowIcon } from './icons/spot-inflow';
import { SpotPointIcon } from './icons/spot-point';
import { SpotSeamIcon } from './icons/spot-seam';

// --- Mappings ---
const statusColors: Record<ScoreStatus, string> = {
    "Prime": "var(--score-prime)",
    "Very Good": "var(--score-very-good)",
    "Good": "var(--score-good)",
    "Fair": "var(--score-fair)",
    "Fair-Slow": "var(--score-fair-slow)",
    "Poor": "var(--score-poor)",
    "Very Poor": "var(--score-very-poor)",
};

const lureIcons: Record<LureFamily, React.FC<any>> = {
    'Live': LureLiveIcon,
    'Crank/Swim': LureCrankSwimIcon,
    'Spinner': LureSpinnerIcon,
    'Soft': LureSoftIcon
};

const spotIcons: Record<string, React.FC<any>> = {
    'windward_bank': SpotBankIcon,
    'windward_point': SpotPointIcon,
    'shade_cover': SpotCoverIcon,
    'flats_weeds': SpotFlatIcon,
    'inflow_creek': SpotInflowIcon,
    'transition_line': SpotSeamIcon,
    'current_seam': SpotSeamIcon,
    'behind_structure': SpotCoverIcon,
    'drop_off': SpotDropOffIcon,
    'thermocline': SpotDropOffIcon,
};


interface CastingAdvisorPanelProps {
    isLoading: boolean;
    conditions?: CastingConditions | null;
    species: "bream" | "bass" | "carp";
}

export function CastingAdvisorPanel({ isLoading, conditions, species }: CastingAdvisorPanelProps) {
    const rankingOutput = useMemo(() => {
        if (!conditions) return null;
        return rankCastingSpots({ speciesKey: species, conditions });
    }, [conditions, species]);

    if (isLoading) {
        return <CastingAdvisorSkeleton />;
    }

    if (!rankingOutput || !conditions) {
        return (
            <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[210px] p-4 flex items-center justify-center">
                <p className="text-center font-medium">Not enough data for casting advice.</p>
            </Card>
        );
    }
    
    const { topPicks, confidenceScore, topPick } = rankingOutput;
    const confidenceStatus = getStatusFromScore(confidenceScore);
    const confidenceColor = statusColors[confidenceStatus];

    const patternString = `${conditions.pressureTrendHpaPer3h <= -0.5 ? 'Falling pressure' : conditions.pressureTrendHpaPer3h >= 0.5 ? 'Rising pressure' : 'Steady pressure'} + ${conditions.cloudPct > 60 ? 'Overcast' : 'Clear skies'}`;
    const TopPickLureIcon = lureIcons[topPick.primaryLure];

    return (
        <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[210px] p-4" aria-live="polite">
            <div className="flex h-full items-center gap-3">
                {/* Left Column */}
                <div className="flex flex-col w-[110px] flex-shrink-0">
                    <span className="font-body text-sm text-white/90">Where to cast</span>
                     <p className="font-body text-xs text-white/85 capitalize mt-1.5">{patternString}</p>
                    <span className="font-headline font-semibold text-[44px] leading-none text-white mt-1">{confidenceScore}</span>
                    <Badge
                        className="mt-1.5 h-[22px] rounded-full self-start"
                        style={{ backgroundColor: `hsla(${confidenceColor}, 0.16)`, color: `hsl(${confidenceColor})` }}
                    >
                        {confidenceStatus}
                    </Badge>
                    <span className="font-body text-xs text-white/75 mt-auto">Based on last 24–72h</span>
                </div>

                {/* Center "Top Pick" Pill */}
                <div className="flex-shrink-0 w-14 h-full bg-white/18 rounded-xl flex flex-col items-center justify-center text-center p-1 space-y-2">
                    <span className="font-body text-[11px] font-medium text-white/70">Top pick</span>
                    <p className="font-semibold text-xs leading-tight text-white/95">{topPick.label}</p>
                    <div
                        className="w-full py-1 rounded-lg flex flex-col items-center justify-center"
                         style={{ backgroundColor: `hsl(${statusColors[topPick.band]})` }}
                    >
                        <TopPickLureIcon className="w-6 h-6 text-white" />
                        <span className="text-[10px] font-bold text-white mt-1">{topPick.primaryLure}</span>
                    </div>
                </div>

                {/* Right Column: Ranked Spots Strip */}
                <div className="flex-1 overflow-x-auto space-x-2.5 no-scrollbar h-full">
                    <div className="flex h-full items-stretch">
                       {topPicks.slice(0, 7).map(spot => (
                           <SpotCell key={spot.spotKey} spot={spot} isTopPick={spot.spotKey === topPick.spotKey} />
                       ))}
                    </div>
                </div>

                <div className="absolute top-4 right-4 text-right">
                    <span className="font-body text-xs text-white/75">Ranked by conditions</span>
                </div>
            </div>
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Card>
    );
}

function SpotCell({ spot, isTopPick }: { spot: RankedSpot, isTopPick: boolean }) {
    const SpotIcon = spotIcons[spot.spotKey] || SpotPointIcon;
    const LureIcon = lureIcons[spot.primaryLure];
    const bandColor = statusColors[spot.band];

    return (
        <div
            className={cn(
                "flex-shrink-0 w-[84px] flex flex-col items-center justify-between text-center p-2 rounded-lg relative overflow-hidden",
                isTopPick && "bg-white/18"
            )}
        >
            <SpotIcon className="w-5 h-5 text-white mt-1" />
            <span className="text-xs text-white/85 leading-tight">{spot.label}</span>
            <span className="font-headline font-semibold text-base text-white">{spot.score}</span>
            <LureIcon className="w-4 h-4 text-white/80" />
            <div 
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: `hsl(${bandColor})` }}
            />
        </div>
    );
}


function getStatusFromScore(score: number): ScoreStatus {
    if (score >= 95) return "Prime";
    if (score >= 80) return "Very Good";
    if (score >= 67) return "Good";
    if (score >= 55) return "Fair";
    if (score >= 45) return "Fair-Slow";
    if (score >= 30) return "Poor";
    return "Very Poor";
}

function CastingAdvisorSkeleton() {
    return (
         <Card className="w-full rounded-xl shadow-floating border-0 bg-muted/30 h-[210px] p-4">
             <div className="flex h-full items-center gap-3 animate-pulse">
                {/* Left Column */}
                <div className="flex flex-col w-[110px] flex-shrink-0 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/20" />
                    <Skeleton className="h-3 w-full bg-white/20" />
                    <Skeleton className="h-10 w-full bg-white/20 mt-2" />
                    <Skeleton className="h-5 w-1/2 bg-white/20" />
                </div>
                {/* Center Column */}
                <Skeleton className="w-14 h-full bg-white/20 rounded-xl" />
                
                {/* Right Column */}
                <div className="flex-1 flex overflow-x-auto space-x-2.5 h-full">
                   {[...Array(5)].map((_, i) => (
                       <Skeleton key={i} className="w-[84px] h-full bg-white/20 rounded-lg"/>
                   ))}
                </div>
             </div>
        </Card>
    );
}
