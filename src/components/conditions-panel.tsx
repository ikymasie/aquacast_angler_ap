
'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { WeatherIcon } from "./weather-icon";
import { format, parseISO } from 'date-fns';
import { Skeleton } from "./ui/skeleton";
import { getCachedWeatherData } from "@/services/weather/client";
import type { Location, WeatherApiResponse } from "@/lib/types";
import { MOCK_LOCATION } from "@/lib/types";

// A simple function to derive a condition string from the available data.
// In a real app, this could be more sophisticated, mapping weather codes etc.
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
            wind: { speed: Math.round(currentHour.windKph), dirDeg: currentHour.windDeg }
        },
        hours: apiData.hourly.slice(nowIndex, nowIndex + 5).map((h, i) => ({
            timeISO: h.t,
            label: i === 0 ? "Now" : format(parseISO(h.t), 'ha'),
            condition: getConditionFromHour(h),
            tempC: Math.round(h.tempC),
            wind: { speed: Math.round(h.windKph), dirDeg: h.windDeg },
            precipMm: h.precipMm
        })),
        nowIndex: 0 // Since we slice the array, "Now" is always at index 0
    };
}


export function ConditionsPanel() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const apiResponse = await getCachedWeatherData(MOCK_LOCATION);
                const transformedData = transformWeatherData(apiResponse, MOCK_LOCATION);
                setData(transformedData);
            } catch (error) {
                console.error("Failed to load weather data for ConditionsPanel:", error);
                setData(null); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);


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
    const currentDate = new Date(current.dateISO);
    const nowHour = hours[data.nowIndex];

  return (
    <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[180px] p-4" aria-live="polite">
        <div className="flex h-full items-center gap-3">
            {/* Left Column */}
            <div className="flex flex-col w-[110px] flex-shrink-0">
                <span className="font-body text-sm text-white/90">{current.condition}</span>
                <span className="font-headline font-semibold text-[44px] leading-none text-white">{current.tempC}°</span>
                <div className="mt-1.5">
                    <span className="font-body text-xs text-white/80 block">{current.weekday}</span>
                    <span className="font-body text-xs text-white/80 block">{format(currentDate, 'dd.MM.yyyy')}</span>
                </div>
                 <div className="flex items-center gap-2 mt-3">
                    <WeatherIcon condition="Wind" className="w-6 h-6 text-white/90" windDeg={current.wind.dirDeg}/>
                </div>
            </div>

            {/* Center Column: Now Pillar */}
            <div className="flex-shrink-0 w-14 h-[148px] bg-white/20 rounded-lg flex flex-col items-center justify-evenly text-center p-1">
                 <span className="font-body text-caption text-white/70">{nowHour.label}</span>
                 <WeatherIcon condition={nowHour.condition} className="w-5 h-5 text-white"/>
                 <span className="font-headline font-semibold text-sm">{nowHour.tempC}°</span>
                 <div className="flex items-center flex-col gap-1">
                    <WeatherIcon condition="Wind" className="w-4 h-4 text-white/90" windDeg={nowHour.wind.dirDeg}/>
                    <span className="font-headline text-xs text-white/90">{nowHour.wind.speed}</span>
                 </div>
            </div>
            
            {/* Right Column: Hourly Strip */}
            <div className="flex-1 flex overflow-x-auto space-x-2">
                {hours.slice(1).map((hour: any) => (
                    <div key={hour.timeISO} className="flex-shrink-0 w-14 flex flex-col items-center text-center space-y-1 py-2" aria-label={`${hour.label}, ${hour.condition}, ${hour.tempC} degrees, wind ${hour.wind.speed} kilometers per hour`}>
                         <span className="font-body text-caption text-white/75">{hour.label}</span>
                         <WeatherIcon condition={hour.condition} className="w-5 h-5 my-1 text-white"/>
                         <span className="font-headline font-semibold text-sm text-white/90">{hour.tempC}°</span>
                         <div className="flex items-center flex-col gap-1">
                            <WeatherIcon condition="Wind" className="w-3.5 h-3.5 text-white/75" windDeg={hour.wind.dirDeg}/>
                            <span className="font-headline text-xs text-white/75">{hour.wind.speed}</span>
                         </div>
                    </div>
                ))}
            </div>

            {/* Top-right Label */}
             <div className="absolute top-4 right-4 text-right">
                <span className="font-body text-xs text-white/75 capitalize">{locationName.split(',')[0]}</span>
                <span className="font-body text-xs text-white/75 block">{format(currentDate, 'p')}</span>
            </div>
        </div>
    </Card>
  );
}

function ConditionsSkeleton() {
    return (
        <Card className="w-full rounded-xl shadow-floating border-0 bg-muted/30 h-[180px] p-4">
             <div className="flex h-full items-center gap-3 animate-pulse">
                {/* Left Column */}
                <div className="flex flex-col w-[110px] flex-shrink-0 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/20" />
                    <Skeleton className="h-10 w-full bg-white/20" />
                    <Skeleton className="h-3 w-1/2 bg-white/20" />
                    <Skeleton className="h-3 w-2/3 bg-white/20" />
                </div>
                {/* Center Column */}
                <Skeleton className="w-14 h-[148px] bg-white/20 rounded-lg" />
                
                {/* Right Column */}
                <div className="flex-1 flex overflow-x-auto space-x-2">
                   {[...Array(4)].map((_, i) => (
                       <Skeleton key={i} className="w-14 h-[120px] bg-white/20 rounded-lg"/>
                   ))}
                </div>
             </div>
        </Card>
    )
}

    