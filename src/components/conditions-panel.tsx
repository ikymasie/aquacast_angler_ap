
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Cloud, ArrowUp } from "lucide-react";
import { WeatherIcon } from "./weather-icon";

const hourlyData = [
    { time: '5PM', condition: 'Cloudy', temp: 24, windSpeed: 3.1, windDir: 'N' },
    { time: '6PM', condition: 'Partly Cloudy', temp: 23, windSpeed: 2.9, windDir: 'N' },
    { time: '7PM', condition: 'Partly Cloudy', temp: 22, windSpeed: 2.5, windDir: 'NE' },
    { time: '8PM', condition: 'Clear', temp: 21, windSpeed: 2.2, windDir: 'NE' },
    { time: '9PM', condition: 'Clear', temp: 20, windSpeed: 2.0, windDir: 'E' },
]

export function ConditionsPanel() {
  return (
    <Card className="w-full rounded-[20px] shadow-floating border-0 gradient-fishing-panel text-white h-[180px] p-4">
        <div className="flex h-full">
            {/* Left Block */}
            <div className="flex flex-col min-w-[96px]">
                <span className="font-body text-sm text-white/90">Cloudy</span>
                <span className="font-numeric font-semibold text-numeric-xl">25°</span>
                <span className="font-body text-caption text-white/80 mt-1">Friday 27.05.2022</span>
                <div className="flex items-center gap-2 mt-3">
                    <Cloud className="w-5 h-5 text-white/90"/>
                    <span className="font-numeric text-sm">3.2</span>
                </div>
            </div>

            {/* Now Pill */}
            <div className="flex-shrink-0 w-14 h-full bg-white/10 rounded-xl flex flex-col items-center justify-center text-center mx-2">
                 <span className="font-body text-caption text-white/70">Now</span>
                 <WeatherIcon condition="Cloudy" className="w-5 h-5 my-2"/>
                 <span className="font-numeric font-semibold text-sm">25°</span>
                 <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3"/>
                    <span className="font-numeric text-xs">3.2</span>
                 </div>
            </div>
            
            {/* Hourly Strip */}
            <div className="flex-1 flex overflow-x-auto space-x-2">
                {hourlyData.map(hour => (
                    <div key={hour.time} className="flex-shrink-0 w-14 flex flex-col items-center text-center">
                         <span className="font-body text-caption text-white/70">{hour.time}</span>
                         <WeatherIcon condition={hour.condition} className="w-5 h-5 my-2"/>
                         <span className="font-numeric font-semibold text-sm">{hour.temp}°</span>
                         <div className="flex items-center gap-1 mt-1">
                            <ArrowUp className="w-3 h-3"/>
                            <span className="font-numeric text-xs">{hour.windSpeed}</span>
                         </div>
                    </div>
                ))}
            </div>

             <div className="absolute top-4 right-4 text-right">
                <span className="font-body text-xs text-white/75">izmir</span>
                <span className="font-body text-xs text-white/75 block">7PM</span>
            </div>
        </div>
    </Card>
  );
}
