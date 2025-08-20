'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CURRENT_CONDITIONS } from "@/lib/types";
import { Droplets, Gauge, Thermometer, Wind, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { WeatherIcon } from "./weather-icon";

export function CurrentConditionsCard() {
  const data = MOCK_CURRENT_CONDITIONS;

  const PressureTrendIcon = 
    data.pressureTrend === 'rising' ? TrendingUp : 
    data.pressureTrend === 'falling' ? TrendingDown : Minus;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-headline text-h2">Current Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-full">
              <WeatherIcon condition={data.condition} className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-numeric-l font-bold">{data.temperature}°C</p>
              <p className="text-body text-muted-foreground">{data.condition}</p>
            </div>
          </div>
          <InfoItem icon={Wind} label="Wind" value={`${data.windSpeed} km/h ${data.windDirection}`} />
          <InfoItem icon={Droplets} label="Humidity" value={`${data.humidity}%`} />
          <InfoItem icon={Gauge} label="Pressure" value={`${data.pressure} hPa`} trendIcon={PressureTrendIcon} />
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trendIcon?: React.ElementType;
}

function InfoItem({ icon: Icon, label, value, trendIcon: TrendIcon }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-secondary p-2 rounded-full">
        <Icon className="h-6 w-6 text-secondary-foreground" />
      </div>
      <div>
        <p className="font-semibold text-body">{value}</p>
        <p className="text-caption text-muted-foreground flex items-center gap-1">
          {label}
          {TrendIcon && <TrendIcon className="h-4 w-4" />}
        </p>
      </div>
    </div>
  );
}
