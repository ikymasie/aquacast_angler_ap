
'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { WeatherIcon } from "./weather-icon";
import { format, parseISO } from 'date-fns';
import { Skeleton } from "./ui/skeleton";
import type { Location, WeatherApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getCachedWeatherData } from "@/services/weather/client";

// A simple function to derive a condition string from the available data.
function getConditionFromHour(hour: any): string {
    if (hour.precipMm > 0.5) return "Rainy";
    if (hour.cloudPct > 80) return "Cloudy";
    if (hour.cloudPct > 40) return "Partly Cloudy";
    return "Clear";
}

// Data transformer to map API response to the component's expected data contract
function transformWeatherData(apiData: WeatherApiResponse, location: Location) {
    if (!apiData || !apiData.hourly || apiData.hourly.length === 0) {
        return null;
    }

    const now = new Date();
    // Find the current hour, or the next future hour
    let nowIndex = apiData.hourly.findIndex(h => parseISO(h.t) >= now);
    if (nowIndex === -1) nowIndex = 0; // Fallback

    const currentHour = apiData.hourly[nowIndex];

    return {
        locationName: location.name,
        current: {
            condition: getConditionFromHour(currentHour),
            tempC: Math.round(currentHour.tempC),
            dateISO: currentHour.t,
            weekday: format(parseISO(currentHour.t), 'EEEE'),
            wind: { speed: currentHour.windKph, dirDeg: currentHour.windDeg }
        },
        hours: apiData.hourly.slice(nowIndex, nowIndex + 8).map((h, i) => ({
            timeISO: h.t,
            label: i === 0 ? "Now" : format(parseISO(h.t), 'p').replace(':00',''),
            condition: getConditionFromHour(h),
            tempC: Math.round(h.tempC),
            wind: { speed: h.windKph, dirDeg: h.windDeg },
            precipMm: h.precipMm
        })),
        nowIndex: 0 // Since we slice the array, "Now" is always at index 0
    };
}


export function ConditionsPanel({location, initialData}: {location: Location, initialData?: WeatherApiResponse | null }) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) {
            setData(transformWeatherData(initialData, location));
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                const apiResponse = await getCachedWeatherData(location);
                const transformedData = transformWeatherData(apiResponse, location);
                setData(transformedData);
            } catch (error) {
                console.error("Failed to load weather data for ConditionsPanel:", error);
                setData(null); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [location, initialData]);

    if (isLoading) {
        return <ConditionsSkeleton />
    }

    if (!data) {
        return (
            <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[180px] p-4 flex items-center justify-center">
                <p className="text-center font-medium">Could not load weather data.</p>
            </Card>
        )
    }
    
    const { current, hours, locationName } = data;
    const currentDate = parseISO(current.dateISO);

  return (
    <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[180px] p-4" aria-live="polite">
        <div className="flex h-full items-center justify-between gap-3">
            {/* Left Column */}
            <div className="flex flex-col w-[130px] flex-shrink-0 text-left justify-between h-full py-2">
                <div>
                    <span className="font-body text-lg text-white/90">{current.condition}</span>
                    <span className="font-headline font-semibold text-5xl leading-tight text-white">{current.tempC}°</span>
                </div>
                <div>
                    <span className="font-body font-medium text-sm text-white/80 block">{current.weekday}</span>
                    <span className="font-body text-sm text-white/80 block">{format(currentDate, 'dd.MM.yyyy')}</span>
                </div>
                 <div className="flex items-center gap-2 mt-2">
                    <WeatherIcon condition="Wind" className="w-8 h-8 text-white/90" />
                </div>
            </div>

            {/* Right Column: Hourly Strip */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
                <div className="flex h-full items-stretch gap-2">
                    {hours.map((hour: any, index: number) => (
                        <div 
                            key={hour.timeISO} 
                            className={cn(
                                "flex-shrink-0 w-16 h-full flex flex-col items-center justify-between text-center p-2 rounded-lg transition-all",
                                index === 0 && "bg-white/20"
                            )}
                            aria-label={`${hour.label}, ${hour.condition}, ${hour.tempC} degrees, wind ${hour.wind.speed.toFixed(1)} kilometers per hour`}
                        >
                             <span className="font-body text-sm font-medium text-white/85">{hour.label}</span>
                             <WeatherIcon 
                                condition={hour.condition}
                                className="w-8 h-8 text-white"
                            />
                             <span className="font-headline font-semibold text-lg">{hour.tempC}°</span>
                             <div className="flex flex-col items-center gap-0.5">
                                <WeatherIcon 
                                    condition="Wind" 
                                    className="w-5 h-5 text-white/90" 
                                    windDeg={hour.wind.dirDeg}
                                />
                                <span className="font-body text-xs text-white/90">{hour.wind.speed.toFixed(1)}</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top-right Label */}
             <div className="absolute top-4 right-4 text-right">
                <span className="font-body text-lg font-semibold text-white/90 capitalize">{locationName.split(',')[0]}</span>
            </div>
        </div>
         <style jsx>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
    </Card>
  );
}

function ConditionsSkeleton() {
    return (
        <Card className="w-full rounded-xl shadow-floating border-0 bg-muted/30 h-[180px] p-4">
             <div className="flex h-full items-center justify-between gap-3 animate-pulse">
                {/* Left Column */}
                <div className="flex flex-col w-[130px] flex-shrink-0 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-white/20" />
                    <Skeleton className="h-12 w-full bg-white/20" />
                    <Skeleton className="h-4 w-1/2 bg-white/20" />
                    <Skeleton className="h-4 w-2/3 bg-white/20" />
                </div>
                
                {/* Right Column */}
                <div className="flex-1 flex justify-end gap-2">
                   {[...Array(5)].map((_, i) => (
                       <Skeleton key={i} className="w-16 h-[148px] bg-white/20 rounded-lg"/>
                   ))}
                </div>
             </div>
        </Card>
    )
}
