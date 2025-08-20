
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, Sun, CloudSun, Sunset, Moon, Cloud } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import type { DaypartScore, ScoreStatus, DaypartName } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";


const daypartIcons: Record<DaypartName, React.ElementType> = {
    Morning: Sun,
    Midday: CloudSun,
    Afternoon: Sunset,
    Evening: Sunset,
    Night: Moon,
};

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


interface DaypartScorecardProps {
    speciesKey: 'bream' | 'bass' | 'carp';
    sunriseISO: string;
    sunsetISO: string;
    daypartScores: DaypartScore[];
}

export function DaypartScorecard({ daypartScores }: DaypartScorecardProps) {
    
    if (!daypartScores || daypartScores.length === 0) {
        return <div className="text-center p-4">Loading daypart scores...</div>
    }
    
    return (
        <Card className="rounded-xl shadow-card p-4">
            <CardHeader className="flex-row items-center justify-between p-0 mb-4">
                <CardTitle className="font-body text-sm text-foreground font-normal">
                    Today’s bite by time of day
                </CardTitle>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="flex items-center justify-center h-11 w-11 -mr-2">
                                <Info className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Scores are averaged from the best hours within each time block.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                   {daypartScores.map(part => (
                       <DaypartTile key={part.name} {...part} />
                   ))}
                </div>
            </CardContent>
        </Card>
    );
}


function DaypartTile({ name, avgScore, status, bestWindow }: DaypartScore) {
    const Icon = daypartIcons[name] || Cloud;
    const ringColor = statusColors[status];

    return (
        <div className="rounded-2xl border p-3 h-[112px] flex flex-col justify-between hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-xs text-muted-foreground">{name}</span>
                </div>
                <Badge className={cn("h-5 px-1.5 text-xs", statusBadgeClasses[status])}>{status}</Badge>
            </div>
            
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                 <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        className="stroke-current text-border"
                        strokeWidth="2"
                    />
                    <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="2.5"
                        strokeDasharray={`${avgScore}, 100`}
                        strokeLinecap="round"
                        transform="rotate(90 18 18)"
                    />
                </svg>
                 <div className="absolute flex flex-col items-center">
                    <span className="font-headline text-lg font-semibold text-foreground">{Math.round(avgScore)}</span>
                    <span className="text-xs text-muted-foreground -mt-1">avg</span>
                 </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs text-foreground">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>
                    {bestWindow 
                        ? `${format(parseISO(bestWindow.start), 'HH:mm')} - ${format(parseISO(bestWindow.end), 'HH:mm')}`
                        : "—"}
                </span>
            </div>
        </div>
    );
}
