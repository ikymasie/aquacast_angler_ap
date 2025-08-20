'use client';

import { Suspense } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Cloud,
  Droplets,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpeciesSelector } from '@/components/species-selector';
import { InteractiveMap } from '@/components/interactive-map';
import { ForecastGraphs } from '@/components/forecast-graphs';
import { FishingSuccessCard } from '@/components/fishing-success-card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function SpotHeaderCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
             Back to search
          </Link>
          <CardTitle className="font-headline text-h2">Lake Harmony, PA</CardTitle>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-teal-100 text-teal-600">
                <Cloud className="w-4 h-4 mr-2"/>
                Cloudy 22°
            </Badge>
            <Button variant="ghost" size="icon">
                <Bookmark className="w-6 h-6" />
            </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: 'default' | 'active';
}) {
  return (
    <Card
      className={
        variant === 'active'
          ? 'bg-teal-100 text-teal-600'
          : 'bg-card text-card-foreground'
      }
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-4">
          <Icon className="w-6 h-6 mt-1" />
          <div>
            <p className="text-caption font-medium">{label}</p>
            <p className="font-headline text-h3 font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UVIndexWidget() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">UV Index</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mx-auto w-[140px] h-[70px] bg-gray-200 rounded-t-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div>
                     <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-1/2 bg-black transform-origin-top" style={{transform: "rotate(-45deg)"}}>
                        <div className="w-3 h-3 bg-white border-2 border-black rounded-full absolute -top-1.5 -left-1"></div>
                    </div>
                </div>
                 <div className="flex justify-between mt-2 text-caption text-muted-foreground">
                    <span>Sunrise</span>
                    <span>Sunset</span>
                </div>
            </CardContent>
        </Card>
    )
}

function SunriseSunsetDial() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Daylight</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-center">
                 <div>
                    <Sunrise className="w-8 h-8 mx-auto text-yellow-500"/>
                    <p className="font-semibold">6:05 AM</p>
                    <p className="text-caption text-muted-foreground">Sunrise</p>
                </div>
                <div>
                    <Sunset className="w-8 h-8 mx-auto text-orange-500"/>
                    <p className="font-semibold">8:45 PM</p>
                    <p className="text-caption text-muted-foreground">Sunset</p>
                </div>
            </CardContent>
        </Card>
    )
}

function DailyAccordion() {
  // Mock data for 7-day forecast
  const weekForecast = [
    { day: 'MON', icon: 'cloud-sun', min: 18, max: 28 },
    { day: 'TUE', icon: 'sun', min: 20, max: 30 },
    { day: 'WED', icon: 'cloud-rain', min: 16, max: 24 },
    { day: 'THU', icon: 'wind', min: 15, max: 22 },
    { day: 'FRI', icon: 'sun', min: 18, max: 28 },
    { day: 'SAT', icon: 'cloud', min: 19, max: 26 },
    { day: 'SUN', icon: 'cloud-sun', min: 21, max: 29 },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">7-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        {weekForecast.map(item => (
            <div key={item.day} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <span className="font-bold w-12">{item.day}</span>
                <Cloud className="w-6 h-6 text-muted-foreground" />
                <span className="text-muted-foreground w-12 text-right">{item.min}°</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-orange-400" style={{width: `${(item.max - item.min) / 15 * 100}%`, marginLeft: `${(item.min -15) /15 * 50}%` }}></div>
                </div>
                <span className="font-bold w-12">{item.max}°</span>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function SpotDetailsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <SpotHeaderCard />
      <div className="mt-4">
         <SpeciesSelector selectedSpecies="Bass" onSelectSpecies={() => {}} />
      </div>
      <div className="mt-4">
        <FishingSuccessCard />
      </div>
      <div className="mt-4">
        <InteractiveMap />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <InfoTile icon={Thermometer} label="Air Temp" value="22°" />
        <InfoTile icon={Wind} label="Wind" value="12 km/h" />
        <InfoTile icon={Droplets} label="Humidity" value="68%" />
        <InfoTile icon={Gauge} label="Pressure" value="1012 hPa" variant="active" />
      </div>
      <div className="mt-4">
        <ForecastGraphs />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <UVIndexWidget/>
        <SunriseSunsetDial/>
      </div>
      <div className="mt-4">
        <DailyAccordion/>
      </div>
    </div>
  );
}
