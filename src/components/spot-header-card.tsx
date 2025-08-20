
'use client';

import { Card } from '@/components/ui/card';

interface SpotHeaderCardProps {
    spot: {
        name: string;
        nearest_town: string;
    };
}

export function SpotHeaderCard({ spot }: SpotHeaderCardProps) {

    return (
        <Card className="rounded-xl shadow-card border-0 p-4 bg-white">
            <h1 className="font-headline text-h2 text-ink-900">{spot.name}</h1>
            <p className="text-muted-foreground text-sm -mt-1">{spot.nearest_town}</p>
        </Card>
    );
}
