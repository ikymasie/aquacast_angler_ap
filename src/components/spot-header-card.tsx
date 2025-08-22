
'use client';

import { Card } from '@/components/ui/card';
import { Button } from './ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserSpot } from '@/lib/types';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface SpotHeaderCardProps {
    spot: Partial<UserSpot> & { name: string; nearest_town: string };
    onToggleFavorite: () => void;
}

export function SpotHeaderCard({ spot, onToggleFavorite }: SpotHeaderCardProps) {
    const isFavorite = spot.isFavorite;

    return (
        <Card className="rounded-xl shadow-card border-0 p-4 bg-white flex justify-between items-start">
            <div>
                <h1 className="font-headline text-h2 text-ink-900">{spot.name}</h1>
                <p className="text-muted-foreground text-sm -mt-1">{spot.nearest_town}</p>
            </div>
            {spot.isUserSpot ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-9 h-9 text-muted-foreground hover:text-amber-500"
                                onClick={onToggleFavorite}
                            >
                                <Star className={cn("w-6 h-6 transition-all", isFavorite && "fill-amber-400 text-amber-500")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : null}
        </Card>
    );
}
