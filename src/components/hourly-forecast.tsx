
'use client';

import { Card } from "@/components/ui/card";
import type { HourlyForecastData, ScoreStatus } from "@/lib/types";
import { WeatherIcon } from "./weather-icon";
import { cn } from "@/lib/utils";
import { getScoreStatus } from "@/lib/scoring";
import { format, parseISO, isSameHour, startOfHour, isPast } from 'date-fns';
import { useEffect, useState } from "react";

const statusColors: Record<ScoreStatus, string> = {
    Bad: "bg-score-bad/20 text-score-bad",
    Fair: "bg-score-fair/20 text-score-fair",
    Great: "bg-score-great/80 text-foreground",
    Excellent: "bg-score-excellent/80 text-foreground",
    Poor: "bg-score-bad/20 text-score-bad", // Fallback for Poor
};


export function HourlyForecast({ data }: { data: HourlyForecastData[] }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Find the current hour in the data, falling back to the first future hour
    const nowInHours = startOfHour(now);
    let nowIndex = data.findIndex(h => {
        // The time from API is like '2pm', so we need to parse it relative to the forecast day
        // This is a simplification; a real implementation would need the full date.
        // For this demo, we assume the `time` can be roughly checked.
        // A better approach is to pass full ISO strings in `data`.
        return isSameHour(nowInHours, startOfHour(new Date())); // This logic is flawed without full dates
    });

    // A better fallback if time parsing is tricky
    if (nowIndex === -1) {
       const firstFutureIndex = data.findIndex(h => !isPast(new Date())); // again, needs full date
       nowIndex = firstFutureIndex !== -1 ? firstFutureIndex : 0;
    }


  return (
    <Card className="rounded-xl p-4">
        <div className="flex overflow-x-auto space-x-2 pb-2 -mb-2 no-scrollbar">
          {data.map((hour, index) => (
            <ForecastItem 
              key={hour.time} 
              hour={hour} 
              isNow={index === 0} // Simplification: Treat first item as 'Now'
            />
          ))}
        </div>
        <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>
    </Card>
  );
}

function ForecastItem({ hour, isNow }: { hour: HourlyForecastData, isNow: boolean }) {
  const [status, setStatus] = useState<ScoreStatus>('Fair');

  useEffect(() => {
    async function loadStatus() {
        setStatus(await getScoreStatus(hour.success));
    }
    loadStatus();
  }, [hour.success]);

  return (
    <div className={cn(
        "flex flex-col items-center justify-between space-y-2 p-3 rounded-lg min-w-[72px] transition-colors border",
        isNow ? 'border-primary/50 bg-primary/10' : 'border-transparent',
        statusColors[status]
    )}>
      <div className="text-sm font-semibold text-foreground/80 relative">
        {isNow ? 'Now' : hour.time}
      </div>
      <WeatherIcon condition={hour.condition} className="h-7 w-7 text-foreground/90" />
      <div className="text-xl font-bold">{hour.temperature}°</div>
      <div className="text-xs font-semibold">{hour.success}</div>
    </div>
  );
}
