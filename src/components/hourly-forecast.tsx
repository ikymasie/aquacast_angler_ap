
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_HOURLY_FORECAST } from "@/lib/types";
import type { HourlyForecastData } from "@/lib/types";
import { WeatherIcon } from "./weather-icon";

export function HourlyForecast() {
  const data = MOCK_HOURLY_FORECAST;
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Hourly Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto space-x-2 pb-2 -mb-2">
          {data.map((hour, index) => (
            <ForecastItem key={hour.time} hour={hour} isNow={index === 0} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastItem({ hour, isNow }: { hour: HourlyForecastData, isNow: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-between space-y-2 p-3 rounded-lg min-w-[72px] transition-colors ${isNow ? 'bg-primary/10 border border-primary/20' : 'bg-secondary'}`}>
      <div className="text-sm font-semibold text-muted-foreground relative">
        {isNow ? 'Now' : hour.time}
      </div>
      <WeatherIcon condition={hour.condition} className="h-8 w-8 text-accent-foreground" />
      <div className="text-xl font-bold">{hour.temperature}°</div>
    </div>
  );
}
