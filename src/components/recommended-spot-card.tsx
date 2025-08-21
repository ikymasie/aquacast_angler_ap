
'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import type { CastingAdviceOutput } from "@/ai/flows/casting-advice-flow";
import { Fish, MapPin } from "lucide-react";
import { getIconForSpot } from "./casting-advisor-panel"; // Assuming getIconForSpot is exported

interface RecommendedSpotCardProps {
    isLoading: boolean;
    advice: CastingAdviceOutput | null;
}

export function RecommendedSpotCard({ isLoading, advice }: RecommendedSpotCardProps) {

    if (isLoading) {
        return <Skeleton className="h-[68px] w-full rounded-xl" />;
    }

    const topSpot = advice?.where_to_cast.ranked_spots[0];

    if (!topSpot) {
        return (
             <Card className="p-4 rounded-xl text-center bg-accent/60 border-primary/20 border">
                <p className="text-sm text-primary-dark font-medium">No clear recommendation available.</p>
                <p className="font-headline text-lg font-bold text-primary-dark mt-1">Check advisor for details</p>
            </Card>
        );
    }
    
    const Icon = getIconForSpot(topSpot.name);

    return (
        <Card className="p-4 rounded-xl text-center bg-accent/60 border-primary/20 border flex items-center justify-center gap-4">
             <div className="flex-shrink-0">
                <Icon className="h-8 w-8 text-primary-dark" />
            </div>
            <div className="text-left">
                <p className="text-sm text-primary-dark/80 font-medium">Recommended Casting Area</p>
                <p className="font-headline text-2xl font-bold text-primary-dark -mt-1">
                    {topSpot.name}
                </p>
            </div>
        </Card>
    );
}
