'use client';

import { Badge } from "@/components/ui/badge";
import type { ScoreStatus } from "@/lib/types";

interface ScoreDisplayProps {
    score: number;
    band: ScoreStatus;
}

const statusColors: Record<ScoreStatus, string> = {
    "Prime": "var(--score-prime)",
    "Very Good": "var(--score-very-good)",
    "Good": "var(--score-good)",
    "Fair": "var(--score-fair)",
    "Fair-Slow": "var(--score-fair-slow)",
    "Poor": "var(--score-poor)",
    "Very Poor": "var(--score-very-poor)",
};

export function ScoreDisplay({ score, band }: ScoreDisplayProps) {
    const color = statusColors[band] || statusColors['Fair'];

    return (
        <div className="text-center my-2">
            <h2 className="font-headline text-5xl font-bold text-white drop-shadow-md">{score}</h2>
            <Badge 
                className="mt-1 h-6 rounded-md text-sm border-0"
                style={{
                    backgroundColor: `hsla(var(${'--score-fair'.replace('hsl(','')}), 0.16)`,
                    color: `hsl(var(${'--score-fair'.replace('hsl(','')}))`,
                }}
            >
                {band}
            </Badge>
        </div>
    );
}
