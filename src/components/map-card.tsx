
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { InteractiveMap } from './interactive-map';
import { cn } from '@/lib/utils';
import { Check, Globe, Map as MapIcon, Mountain } from 'lucide-react';
import type { MapTypeId } from './interactive-map';

interface MapCardProps {
    center: { lat: number, lng: number };
}

type Thumbnail = {
    id: MapTypeId,
    label: string;
    icon: React.ElementType,
}

const mapThumbnails: Thumbnail[] = [
    { id: 'roadmap', label: 'Map', icon: MapIcon },
    { id: 'satellite', label: 'Satellite', icon: Globe },
    { id: 'terrain', label: 'Terrain', icon: Mountain },
];


export function MapCard({ center }: MapCardProps) {
    const [mapTypeId, setMapTypeId] = useState<MapTypeId>('roadmap');

    return (
        <Card className="overflow-hidden h-[400px] md:h-[500px] flex flex-col rounded-xl shadow-card border-2 border-white/30">
            <CardContent className="p-0 flex-1 relative">
                <InteractiveMap center={center} mapTypeId={mapTypeId} />

                <div className="absolute bottom-2 right-2">
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-md border border-white/50">
                        {mapThumbnails.map(thumb => (
                            <button
                                key={thumb.id}
                                onClick={() => setMapTypeId(thumb.id)}
                                className={cn(
                                    "relative rounded-md overflow-hidden w-16 h-11 border-2 transition-all flex flex-col items-center justify-center gap-0.5",
                                    mapTypeId === thumb.id ? "border-primary bg-primary/10 shadow-lg scale-105" : "border-transparent bg-white/50 hover:border-primary/50"
                                )}
                                aria-label={`Switch to ${thumb.label} view`}
                            >
                                <thumb.icon className={cn("w-4 h-4", mapTypeId === thumb.id ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("text-[10px] font-semibold",  mapTypeId === thumb.id ? "text-primary" : "text-muted-foreground")}>{thumb.label}</span>

                                {mapTypeId === thumb.id && (
                                    <div className="absolute top-0.5 right-0.5 bg-primary/80 rounded-full flex items-center justify-center w-3.5 h-3.5">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
