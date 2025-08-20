
'use client';

import { Card } from '@/components/ui/card';
import { ConditionsPanel } from './conditions-panel';
import type { Location, WeatherApiResponse } from '@/lib/types';
import { MOCK_LOCATION } from '@/lib/types';

interface SpotHeaderCardProps {
    spot: {
        name: string;
        nearest_town: string;
    };
    weatherData: WeatherApiResponse | null;
    location: Location;
}

export function SpotHeaderCard({ spot, weatherData, location = MOCK_LOCATION }: SpotHeaderCardProps) {

    const rainProbability = weatherData?.hourly[0]?.precipMm > 0
        ? Math.round(weatherData.hourly[0].precipMm * 100) / 10 // Simplistic mapping
        : 0;

    return (
        <Card className="rounded-xl shadow-card border-0 p-4 bg-white">
            <h1 className="font-headline text-h2 text-ink-900">{spot.name}</h1>
            <p className="text-muted-foreground text-sm -mt-1">{spot.nearest_town}</p>
            
            <div className="mt-4">
                <ConditionsPanel location={location} initialData={weatherData} />
            </div>
            {rainProbability > 0 && (
                <div className="text-right mt-2">
                    <p className="text-caption text-muted-foreground">
                        Rain possibility: <span className="text-primary font-semibold">{rainProbability}%</span>
                    </p>
                </div>
            )}
        </Card>
    );
}

    