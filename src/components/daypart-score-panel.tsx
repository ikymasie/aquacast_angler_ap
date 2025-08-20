
'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sun, Sunset, Moon, Cloud, CloudSun } from "lucide-react";
import { FishBreamIcon } from "./icons/fish-bream";
import { FishBassIcon } from "./icons/fish-bass";
import { FishCarpIcon } from "./icons/fish-carp";
import type { DaypartScore, ScoreStatus, DaypartName, Species, OverallDayScore } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";


const daypartIcons: Record<DaypartName, React.ElementType> = {
    Morning: Sun,
    Midday: CloudSun,
    Afternoon: Sunset,
    Evening: Sunset,
    Night: Moon,
};
const speciesIcons: Record<string, React.ElementType> = {
    bream: FishBreamIcon,
    bass: FishBassIcon,
    carp: FishCarpIcon
}

const statusColors: Record<ScoreStatus, string> = {
    Poor: "hsl(var(--poor))",
    Fair: "hsl(var(--fair))",
    Good: "hsl(var(--good))",
    Excellent: "hsl(var(--good))",
};
const statusBadgeClasses: Record<ScoreStatus, string> = {
    Poor: "bg-poor/20 text-poor",
    Fair: "bg-fair/20 text-fair",
    Good: "bg-good/20 text-good",
    Excellent: "bg-good/20 text-good font-bold",
};


interface DaypartScorePanelProps extends Omit<OverallDayScore, 'dayAvgScore' | 'dayStatus'> {
    speciesKey: 'bream' | 'bass' | 'carp';
    spotName: string;
    successScore: number;
    dayStatus: ScoreStatus;
    dayparts: DaypartScore[];
}

export function DaypartScorePanel(props: DaypartScorePanelProps) {
    
    if (!props.dayparts || props.dayparts.length === 0) {
        return <div className="text-center p-4">Loading daypart scores...</div>
    }

    const { speciesKey, spotName, successScore, dayStatus, bestWindow, dayparts } = props;
    const SpeciesIcon = speciesIcons[speciesKey] || FishBreamIcon;
    
    return (
       <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[180px] p-4">
            <div className="flex h-full items-center gap-3">
                {/* Left Column */}
                <div className="flex flex-col w-[110px] flex-shrink-0 text-center items-center">
                    <span className="font-body text-sm text-white/90">Now</span>
                    <span className="font-headline font-semibold text-[44px] leading-none text-white">{Math.round(successScore)}</span>
                    <Badge className={cn("h-6 mt-1.5 px-3 text-sm border-0", statusBadgeClasses[dayStatus])}>{dayStatus}</Badge>
                    <div className="flex items-center gap-1.5 mt-2 bg-white/10 rounded-full h-6 px-2">
                        <SpeciesIcon className="w-4 h-4 text-white" />
                        <span className="font-body text-xs text-white/90 capitalize">{speciesKey}</span>
                    </div>
                    <p className="font-body text-xs text-white/80 mt-1.5 leading-tight" >{spotName.split(',')[0]}</p>
                </div>

                {/* Center Column: Best Window Pillar */}
                <div className="flex-shrink-0 w-14 h-[148px] bg-white/20 rounded-lg flex flex-col items-center justify-center text-center p-1 space-y-1">
                    <span className="font-body text-caption text-white/70">Best</span>
                    <Clock className="w-5 h-5 text-white"/>
                    <div className="font-body text-sm text-white/95 leading-tight">
                         {bestWindow ? (
                           <>
                                <span>{format(parseISO(bestWindow.start), 'HH:mm')}</span>
                                <span>-</span>
                                <span>{format(parseISO(bestWindow.end), 'HH:mm')}</span>
                           </>
                        ) : (
                           <span>--:--</span>
                        )}
                    </div>
                    {bestWindow && <Badge className={cn("h-5 px-1.5 text-xs border-0", statusBadgeClasses[bestWindow.status])}>{bestWindow.status}</Badge>}
                </div>
                
                {/* Right Column: Daypart Strip */}
                <div className="flex-1 overflow-x-auto no-scrollbar">
                    <div className="flex flex-nowrap items-center h-full gap-2">
                       {dayparts.map(part => (
                           <DaypartCell key={part.name} {...part} />
                       ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
       </Card>
    );
}

function DaypartCell({ name, score, status, hasWindow, isCurrent }: DaypartScore) {
    const Icon = daypartIcons[name] || Cloud;
    const shortLabel = name.substring(0, 4);

    return (
        <div className={cn(
            "flex-shrink-0 w-14 h-[120px] flex flex-col items-center text-center justify-between py-2 rounded-lg",
            isCurrent && "bg-white/10"
        )}>
            <span className="font-body text-xs text-white/80">{shortLabel}</span>
            <Icon 
                className="w-5 h-5 text-white" 
                style={{ color: statusColors[status] }}
            />
            <span className="font-headline font-semibold text-base">{score}</span>
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hasWindow ? statusColors[status] : 'transparent' }}/>
        </div>
    );
}
