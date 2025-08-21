
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { Sunrise, Sunset, Sun, Moon, Thermometer, ShieldCheck } from "lucide-react";
import type { DayContext, RecentWindow } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { getMoonPhaseName } from "@/lib/scoring";


interface QuickMetricsPanelProps {
    dayContext?: DayContext;
    recentWindow?: RecentWindow;
}

export function QuickMetricsPanel({ dayContext, recentWindow }: QuickMetricsPanelProps) {
    const [moonPhaseName, setMoonPhaseName] = useState<string>('...');

    useEffect(() => {
        if (dayContext?.moonPhase) {
            getMoonPhaseName(dayContext.moonPhase).then(setMoonPhaseName);
        }
    }, [dayContext?.moonPhase]);

    if (!dayContext || !recentWindow) {
        return (
             <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Quick Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-xl bg-secondary/50 border-line-200">
             <CardHeader>
                <CardTitle className="font-headline text-lg text-foreground/80">Quick Metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4">
                <InfoItem icon={Sunrise} label="Sunrise" value={format(parseISO(dayContext.sunrise), 'p')} />
                <InfoItem icon={Sunset} label="Sunset" value={format(parseISO(dayContext.sunset), 'p')} />
                <InfoItem icon={Sun} label="Max UV Index" value={dayContext.uvMax.toFixed(1)} />
                <InfoItem icon={Moon} label="Moon Phase" value={moonPhaseName} />
                <InfoItem icon={Thermometer} label="Est. Water Temp" value={`${recentWindow.waterTempC.toFixed(1)}°C`} />
                <InfoItem icon={ShieldCheck} label="Stability" value={`${(1 / recentWindow.stdTempPressure).toFixed(1)}/10`} />
            </CardContent>
        </Card>
    );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-background/60 p-2 rounded-lg border border-line-200">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
