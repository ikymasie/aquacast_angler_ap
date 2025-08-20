'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_HOURLY_FORECAST } from "@/lib/types";
import type { HourlyForecastData } from "@/lib/types";
import { WeatherIcon } from "./weather-icon";

export function HourlyForecast() {
  const data = MOCK_HOURLY_FORECAST;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Hourly Mini-Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto space-x-4 pb-2 -mb-2">
          {data.map((hour) => (
            <ForecastItem key={hour.time} hour={hour} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastItem({ hour }: { hour: HourlyForecastData }) {
  const isNow = hour.time === 'Now';
  return (
    <div className={`flex flex-col items-center justify-between space-y-2 p-3 rounded-lg min-w-[80px] transition-colors ${isNow ? 'bg-primary/10 border border-primary/20' : 'bg-secondary'}`}>
      <div className="text-sm font-semibold text-muted-foreground relative">
        {hour.time}
        {isNow && <Badge className="absolute -top-5 -right-5 scale-90 bg-primary">Now</Badge>}
      </div>
      <WeatherIcon condition={hour.condition} className="h-8 w-8 text-accent-foreground" />
      <div className="text-xl font-bold">{hour.temperature}°</div>
    </div>
  );
}