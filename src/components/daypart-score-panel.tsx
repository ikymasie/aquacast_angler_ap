
'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ThreeHourIntervalScore, RecommendedWindow, ScoreStatus, Species } from "@/lib/types";
import { format, parseISO } from 'date-fns';
import { Clock } from "lucide-react";
import { FishBreamIcon } from "./icons/fish-bream";
import { FishBassIcon } from "./icons/fish-bass";
import { FishCarpIcon } from "./icons/fish-carp";
import { WeatherIcon } from "./weather-icon";

const statusColors: Record<ScoreStatus, string> = {
    Poor: "var(--poor)",
    Fair: "var(--fair)",
    Good: "var(--good)",
    Excellent: "var(--good)",
};

const speciesIcons: Record<'bass' | 'bream' | 'carp', React.FC<any>> = {
    bass: FishBassIcon,
    bream: FishBreamIcon,
    carp: FishCarpIcon,
};


interface DaypartScorePanelProps {
    speciesKey: 'bass' | 'bream' | 'carp';
    spotName: string;
    dayAvgScore: number;
    dayStatus: ScoreStatus;
    intervals: ThreeHourIntervalScore[];
}

function useElementWidth() {
    const [width, setWidth] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const handleResize = useCallback(() => ref.current && setWidth(ref.current.offsetWidth), []);
    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);
    return { ref, width };
}

export function DaypartScorePanel({
    speciesKey,
    spotName,
    dayAvgScore,
    dayStatus,
    intervals
}: DaypartScorePanelProps) {
    const { ref: stripRef, width: stripWidth } = useElementWidth();
    const SpeciesIcon = speciesIcons[speciesKey];

    const getCellStyle = () => {
        if (stripWidth < 220) return { width: 48, icon: 18, score: 'text-[13px]/[18px]', label: 'text-[11px]/[14px]' };
        if (stripWidth < 340) return { width: 56, icon: 20, score: 'text-sm/[20px]', label: 'text-xs/[16px]' };
        return { width: 60, icon: 22, score: 'text-[15px]/[22px]', label: 'text-xs/[16px]' };
    };

    const cellStyle = getCellStyle();

    const getStatusColor = (status: ScoreStatus) => statusColors[status] || "var(--fair)";
    
    return (
        <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[180px] p-4" aria-live="polite">
            <div className="flex h-full items-center gap-3">
                {/* Left Column */}
                <div className="flex flex-col w-[110px] flex-shrink-0">
                    <span className="font-body text-sm text-white/90">Today</span>
                    <span className="font-headline font-semibold text-[44px] leading-none text-white">{dayAvgScore}</span>
                    <Badge
                        className="mt-1.5 h-[22px] rounded-full self-start"
                        style={{ backgroundColor: `hsla(${getStatusColor(dayStatus)}, 0.16)`, color: `hsl(${getStatusColor(dayStatus)})` }}
                    >
                        {dayStatus}
                    </Badge>
                     <div className="flex items-center gap-2 mt-2 h-6 px-2 rounded-full bg-white/15 self-start">
                        <SpeciesIcon className="w-4 h-4 text-white/90" />
                        <span className="font-body text-xs text-white/90 capitalize">{speciesKey}</span>
                     </div>
                    <span className="font-body text-xs text-white/80 mt-1.5 truncate">
                        Next 24h • {spotName.split(',')[0]}
                    </span>
                </div>

                {/* Right Column: 3-hour Interval Strip */}
                <div className="flex-1 overflow-x-auto space-x-2 no-scrollbar" ref={stripRef}>
                    <div className="flex h-full items-stretch">
                        {intervals.map(interval => {
                            const color = getStatusColor(interval.status);
                            return (
                                <div
                                    key={interval.label}
                                    style={{ width: cellStyle.width }}
                                    className={cn(
                                        "flex-shrink-0 flex flex-col items-center justify-between text-center p-2 rounded-lg",
                                        interval.isCurrent && "bg-white/18"
                                    )}
                                >
                                    <span className={cn("font-body text-white/85", cellStyle.label)}>{interval.label}</span>
                                    <WeatherIcon condition={interval.condition} className="text-white" style={{ width: cellStyle.icon, height: cellStyle.icon, color: `hsl(${color})` }} />
                                    <span className={cn("font-headline font-semibold text-white", cellStyle.score)}>{interval.score}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="absolute top-4 right-4 text-right">
                    <span className="font-body text-xs text-white/75">By time of day</span>
                </div>
            </div>
             <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Card>
    );
}
