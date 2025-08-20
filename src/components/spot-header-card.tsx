
'use client';

import { Card } from '@/components/ui/card';
import { ConditionsPanel } from './conditions-panel';
import type { Location, Species, WeatherApiResponse } from '@/lib/types';
import { MOCK_LOCATION } from '@/lib/types';
import { SpeciesSelector } from './species-selector';
import { Skeleton } from './ui/skeleton';

interface SpotHeaderCardProps {
    spot: {
        name: string;
        nearest_town: string;
    };
    weatherData: WeatherApiResponse | null;
    location: Location;
    selectedSpecies: Species;
    onSelectSpecies: (species: Species) => void;
    isLoading: boolean;
}

export function SpotHeaderCard({ spot, weatherData, location = MOCK_LOCATION, selectedSpecies, onSelectSpecies, isLoading }: SpotHeaderCardProps) {

    const rainProbability = weatherData?.hourly[0]?.precipMm > 0
        ? Math.min(100, Math.round(weatherData.hourly[0].precipMm * 40)) // Simplistic mapping, cap at 100
        : 0;

    return (
        <Card className="rounded-xl shadow-card border-0 p-4 bg-white">
            <h1 className="font-headline text-h2 text-ink-900">{spot.name}</h1>
            <p className="text-muted-foreground text-sm -mt-1">{spot.nearest_town}</p>
            
            <div className="mt-4">
                <ConditionsPanel location={location} initialData={weatherData} />
            </div>
            
            <div className="mt-3 grid grid-cols-2 items-center">
                <div className="col-span-2">
                     <SpeciesSelector 
                        selectedSpecies={selectedSpecies}
                        onSelectSpecies={onSelectSpecies}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </Card>
    );
}
