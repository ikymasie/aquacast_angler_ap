'use client';

import { Card } from "@/components/ui/card";
import { Lightbulb, Wind, Gauge, Sun } from "lucide-react";

interface RecommendationCardProps {
    recommendations: string[];
    factors: {
        windKphNow: number;
        pressureTrend6h_hPa: number;
        uvIndexMax: number;
        tempNowC: number;
    }
}

export function RecommendationCard({ recommendations, factors }: RecommendationCardProps) {
    return (
        <Card className="p-3 rounded-xl bg-black/10 backdrop-blur-sm border-white/20 text-white">
            <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">Recommendations</h4>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-white/90 mb-3">
                {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <FactorItem icon={Wind} label="Wind Now" value={`${factors.windKphNow.toFixed(1)} kph`} />
                <FactorItem icon={Gauge} label="Pressure Trend (6h)" value={`${factors.pressureTrend6h_hPa.toFixed(1)} hPa`} />
                <FactorItem icon={Sun} label="Max UV" value={factors.uvIndexMax.toFixed(1)} />
            </div>
        </Card>
    )
}

function FactorItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-white/70" />
            <span className="text-white/70">{label}:</span>
            <span className="font-semibold text-white/90">{value}</span>
        </div>
    )
}
