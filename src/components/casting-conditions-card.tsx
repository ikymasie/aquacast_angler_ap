
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import type { LureAdviceOutput } from "@/ai/flows/lure-advice-flow";
import { Thermometer, Wind, Eye, Droplets, CheckCircle2, XCircle } from "lucide-react";

interface CastingConditionsCardProps {
    isLoading: boolean;
    advice: LureAdviceOutput | null;
}

export function CastingConditionsCard({ isLoading, advice }: CastingConditionsCardProps) {
    if (isLoading) {
        return <CastingConditionsSkeleton />;
    }

    if (!advice) {
        return (
            <Card className="w-full rounded-xl border-dashed border-2 p-4 flex items-center justify-center bg-secondary">
                <p className="text-center font-medium text-muted-foreground">Select a lure to see condition analysis.</p>
            </Card>
        );
    }
    
    const { conditionScore, summary, wind, light, waterClarity } = advice;
    const isGood = conditionScore >= 6;

    return (
        <Card className="rounded-xl shadow-card border-0 p-4 bg-white">
            <CardHeader className="p-0">
                <CardTitle className="font-headline text-lg flex items-center justify-between">
                    <span>Casting Conditions</span>
                     <span className={`flex items-center gap-1.5 text-sm font-semibold ${isGood ? 'text-score-good' : 'text-score-poor'}`}>
                        {isGood ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {conditionScore}/10
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
                <p className="text-muted-foreground text-sm mb-4">{summary}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <InfoItem icon={Wind} label="Wind" value={wind} />
                    <InfoItem icon={Eye} label="Light" value={light} />
                    <InfoItem icon={Droplets} label="Clarity" value={waterClarity} />
                </div>
            </CardContent>
        </Card>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string; }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

function CastingConditionsSkeleton() {
    return (
        <Card className="rounded-xl p-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-4 w-full mt-3" />
            <Skeleton className="h-4 w-3/4 mt-1" />
            <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </Card>
    )
}

    