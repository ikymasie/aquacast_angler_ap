
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
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Current Conditions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
        <InfoItem icon={Thermometer} label="Feels Like" value={`${data.temperature}°C`} />
        <InfoItem icon={Wind} label="Wind" value={`${data.windSpeed} km/h ${data.windDirection}`} />
        <InfoItem icon={Droplets} label="Humidity" value={`${data.humidity}%`} />
        <InfoItem icon={Gauge} label="Pressure" value={`${data.pressure} hPa`} trendIcon={PressureTrendIcon} />
        <InfoItem icon={WeatherIcon} iconProps={{condition: data.condition}} label="Condition" value={data.condition} />
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trendIcon?: React.ElementType;
  iconProps?: any;
}

function InfoItem({ icon: Icon, label, value, trendIcon: TrendIcon, iconProps }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-secondary p-2 rounded-full">
        <Icon className="h-6 w-6 text-secondary-foreground" {...iconProps}/>
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
