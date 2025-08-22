
'use client';

import { Card } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import type { RecommendedWindow, Window as ChancesWindow } from "@/lib/types";

interface RecommendedTimeCardProps {
    window: RecommendedWindow | ChancesWindow | null;
    fallbackWindow?: RecommendedWindow | ChancesWindow | null;
}

export function RecommendedTimeCard({ window, fallbackWindow }: RecommendedTimeCardProps) {
    const displayWindow = window || fallbackWindow;

    if (!displayWindow || !displayWindow.start || !displayWindow.end) {
        return (
            <Card className="p-3 rounded-xl text-center bg-accent/80 border-primary/20 border">
                <p className="text-xs text-primary-dark font-medium">No ideal window found.</p>
                <p className="text-base font-bold text-primary-dark mt-1">Try dawn or dusk</p>
            </Card>
        );
    }
    
    // The window prop can be one of two types, so we need to check for the correct start/end properties
    const startISO = 'start' in displayWindow ? displayWindow.start : displayWindow.startISO;
    const endISO = 'end' in displayWindow ? displayWindow.end : displayWindow.endISO;

    const formatTime = (isoString: string) => {
        const date = parseISO(isoString);
        return format(date, "h:mm");
    }
    const getAmPm = (isoString: string) => {
        const date = parseISO(isoString);
        // Escape literal characters with single quotes
        return format(date, "a");
    }

    const startTime = formatTime(startISO);
    const endTime = formatTime(endISO);
    const startAmPm = getAmPm(startISO);
    const endAmPm = getAmPm(endISO);

    return (
        <Card className="p-3 rounded-xl text-center bg-accent/80 border-primary/20 border">
            <p className="text-xs text-primary-dark/80 font-medium">Recommended Time</p>
            <p className="font-headline text-xl font-bold text-primary-dark -mt-1">
                {startTime} <span className="text-lg">{startAmPm}</span> - {endTime} <span className="text-lg">{endAmPm}</span>
            </p>
        </Card>
    );
}
