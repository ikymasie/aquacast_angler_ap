
'use client';

import { Card } from "@/components/ui/card";
import { WeatherIcon } from "./weather-icon";
import { format } from 'date-fns';
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

const mockData = {
    locationName: "İzmir",
    current: {
      condition: "Cloudy",
      tempC: 25,
      dateISO: "2022-05-27T19:00:00.000Z",
      weekday: "Friday",
      wind: { speed: 3.2, dirDeg: 210 }
    },
    hours: [
        { timeISO: "2022-05-27T19:00:00.000Z", label: "Now", condition: "Cloudy", tempC: 25, wind: { speed: 3.2, dirDeg: 210 }},
        { timeISO: "2022-05-27T20:00:00.000Z", label: "8 PM", condition: "Partly Cloudy", tempC: 23, wind: { speed: 2.9, dirDeg: 220 }},
        { timeISO: "2022-05-27T21:00:00.000Z", label: "9 PM", condition: "Partly Cloudy", tempC: 22, wind: { speed: 2.5, dirDeg: 235 }},
        { timeISO: "2022-05-27T22:00:00.000Z", label: "10 PM", condition: "Clear", tempC: 21, wind: { speed: 2.2, dirDeg: 240 }},
        { timeISO: "2022-05-27T23:00:00.000Z", label: "11 PM", condition: "Clear", tempC: 20, wind: { speed: 2.0, dirDeg: 250 }},
    ],
    nowIndex: 0,
};

// Loading state can be handled by passing `isLoading={true}`
export function ConditionsPanel({ isLoading = false }) {
    if (isLoading) {
        return <ConditionsSkeleton />
    }
    
    const { current, hours, locationName } = mockData;
    const currentDate = new Date(current.dateISO);
    const nowHour = hours[mockData.nowIndex];

  return (
    <Card className="w-full rounded-xl shadow-floating border-0 gradient-fishing-panel text-white h-[180px] p-4">
        <div className="flex h-full items-center gap-3">
            {/* Left Column */}
            <div className="flex flex-col w-[110px] flex-shrink-0">
                <span className="font-body text-sm text-white/90">{current.condition}</span>
                <span className="font-headline font-semibold text-[44px] leading-[48px] text-white">{current.tempC}°</span>
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
                 <span className="font-body text-caption text-white/70">Now</span>
                 <WeatherIcon condition={nowHour.condition} className="w-5 h-5 text-white"/>
                 <span className="font-headline font-semibold text-sm">{nowHour.tempC}°</span>
                 <div className="flex items-center flex-col gap-1">
                    <WeatherIcon condition="Wind" className="w-4 h-4 text-white/90" windDeg={nowHour.wind.dirDeg}/>
                    <span className="font-headline text-xs text-white/90">{nowHour.wind.speed}</span>
                 </div>
            </div>
            
            {/* Right Column: Hourly Strip */}
            <div className="flex-1 flex overflow-x-auto space-x-2">
                {hours.slice(1).map(hour => (
                    <div key={hour.timeISO} className="flex-shrink-0 w-14 flex flex-col items-center text-center space-y-1 py-2">
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
                <span className="font-body text-xs text-white/75 capitalize">{locationName}</span>
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
