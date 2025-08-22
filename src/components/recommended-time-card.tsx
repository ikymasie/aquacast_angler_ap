
'use client';

import { Card } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import type { RecommendedWindow } from "@/lib/types";

interface RecommendedTimeCardProps {
    window: RecommendedWindow;
}

export function RecommendedTimeCard({ window }: RecommendedTimeCardProps) {
    if (!window || !window.start || !window.end) {
        return (
            <Card className="p-3 rounded-xl text-center bg-accent/80 border-primary/20 border">
                <p className="text-xs text-primary-dark font-medium">No ideal window found.</p>
                <p className="text-base font-bold text-primary-dark mt-1">Try dawn or dusk</p>
            </Card>
        );
    }
    
    const formatTime = (isoString: string) => {
        const date = parseISO(isoString);
        return format(date, "h:mm");
    }
    const getAmPm = (isoString: string) => {
        const date = parseISO(isoString);
        // Escape literal characters with single quotes
        return format(date, "a");
    }

    const startTime = formatTime(window.start);
    const endTime = formatTime(window.end);
    const startAmPm = getAmPm(window.start);
    const endAmPm = getAmPm(window.end);

    return (
        <Card className="p-3 rounded-xl text-center bg-accent/80 border-primary/20 border">
            <p className="text-xs text-primary-dark/80 font-medium">Recommended Time</p>
            <p className="font-headline text-xl font-bold text-primary-dark -mt-1">
                {startTime} <span className="text-lg">{startAmPm}</span> - {endTime} <span className="text-lg">{endAmPm}</span>
            </p>
        </Card>
    );
}

