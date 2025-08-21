
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { Sunrise, Sunset, Sun, Moon, Thermometer, ShieldCheck } from "lucide-react";
import type { DayContext, RecentWindow } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

function getMoonPhaseName(phase: number): string {
    if (phase < 0.06 || phase > 0.94) return 'New Moon';
    if (phase < 0.18) return 'Waxing Crescent';
    if (phase < 0.31) return 'First Quarter';
    if (phase < 0.44) return 'Waxing Gibbous';
    if (phase < 0.56) return 'Full Moon';
    if (phase < 0.69) return 'Waning Gibbous';
    if (phase < 0.81) return 'Last Quarter';
    if (phase < 0.94) return 'Waning Crescent';
    return 'New Moon';
}

interface QuickMetricsPanelProps {
    dayContext?: DayContext;
    recentWindow?: RecentWindow;
}

export function QuickMetricsPanel({ dayContext, recentWindow }: QuickMetricsPanelProps) {

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

    const moonPhaseName = getMoonPhaseName(dayContext.moonPhase);

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
