
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConditionsPanel } from '@/components/conditions-panel';
import { MOCK_LOCATION } from '@/lib/types';
import { Bookmark, Star } from 'lucide-react';
import { Button } from './ui/button';

interface SpotHeaderCardProps {
    spot: {
        name: string;
        nearest_town: string;
        isFavorite?: boolean;
    };
}

export function SpotHeaderCard({ spot }: SpotHeaderCardProps) {
    return (
        <Card className="rounded-xl shadow-card border-0 p-4">
            <div className="flex items-center justify-between mb-3">
                <h1 className="font-headline text-h2 text-foreground">{spot.name}</h1>
                 <Button variant="ghost" size="icon" className="h-10 w-10">
                    {spot.isFavorite 
                        ? <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                        : <Bookmark className="w-6 h-6 text-muted-foreground" />
                    }
                </Button>
            </div>
            <ConditionsPanel location={MOCK_LOCATION} />
        </Card>
    );
}
