
'use client';

import React from 'react';
import type { LureFamily, ScoreStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Clock } from "lucide-react";
import { LureSelector } from "./lure-selector";


const statusColors: Record<ScoreStatus, string> = {
    "Prime": "bg-score-prime/20 text-score-prime",
    "Very Good": "bg-score-very-good/20 text-score-very-good",
    "Good": "bg-score-good/20 text-score-good",
    "Fair": "bg-score-fair/20 text-score-fair",
    "Fair-Slow": "bg-score-fair-slow/20 text-score-fair-slow",
    "Poor": "bg-score-poor/20 text-score-poor",
    "Very Poor": "bg-score-very-poor/20 text-score-very-poor",
};

interface CastingAdvisorPanelProps {
    advice: any; // Define a more specific type later
    selectedLure: LureFamily;
    onLureSelect: (lure: LureFamily) => void;
}

export function CastingAdvisorPanel({ advice, selectedLure, onLureSelect }: CastingAdvisorPanelProps) {
    if (!advice) {
        return <Skeleton className="h-[400px] w-full" />;
    }
    
    const { where_to_cast, how_to_fish, when_to_fish } = advice;

    return (
        <Card className="rounded-xl shadow-card">
            <CardHeader>
                <CardTitle className="font-headline text-h2">Casting Advisor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Where to Cast</h3>
                    <p className="text-muted-foreground">{where_to_cast?.summary}</p>
                    <div className="mt-4 space-y-3">
                        {where_to_cast?.ranked_spots.map((spot: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                               <div>
                                   <p className="font-semibold">{spot.name}</p>
                                   <p className="text-sm text-muted-foreground">{spot.reasoning}</p>
                               </div>
                               <Badge className={statusColors[spot.status as ScoreStatus]}>{spot.status}</Badge>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-2">How to Fish: Lure Choice</h3>
                     <LureSelector selectedLure={selectedLure} onLureSelect={onLureSelect} />
                     <p className="text-muted-foreground mt-4">{how_to_fish?.recommendation}</p>
                </div>

                 <div>
                    <h3 className="font-semibold text-lg mb-2">When to Fish</h3>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent border border-primary/20">
                        <Clock className="w-5 h-5 text-primary-dark mt-1" />
                        <div>
                             <p className="font-semibold text-primary-dark">{when_to_fish?.timing_recommendation}</p>
                             <p className="text-sm text-primary-dark/80">{when_to_fish?.reasoning}</p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
