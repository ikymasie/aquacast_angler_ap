
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
            <Card className="p-4 rounded-xl text-center bg-accent border-primary/20 border">
                <p className="text-sm text-primary-dark font-medium">No ideal window found.</p>
                <p className="text-lg font-bold text-primary-dark mt-1">Try dawn or dusk</p>
            </Card>
        );
    }
    
    const formatTime = (isoString: string) => {
        const date = parseISO(isoString);
        return format(date, "h:mm");
    }
    const getAmPm = (isoString: string) => {
        const date = parseISO(isoString);
        return format(date, "A.M");
    }

    const startTime = formatTime(window.start);
    const endTime = formatTime(window.end);
    const ampm = getAmPm(window.start); // Assume same period

    return (
        <Card className="p-4 rounded-xl text-center bg-accent border-primary/20 border">
            <p className="text-sm text-primary-dark/80 font-medium">Recommended time interval.</p>
            <p className="font-headline text-3xl font-bold text-primary-dark mt-1">
                {startTime}-{endTime} <span className="text-2xl">{ampm}</span>
            </p>
        </Card>
    );
}
