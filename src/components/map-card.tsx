
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { InteractiveMap } from './interactive-map';
import { cn } from '@/lib/utils';

interface MapCardProps {
    center: { lat: number, lng: number };
    thumbnails: { id: string; imageUrl: string; hint: string }[];
}

export function MapCard({ center, thumbnails }: MapCardProps) {
    const [activeThumbId, setActiveThumbId] = useState(thumbnails[0]?.id || 'map');

    return (
        <Card className="overflow-hidden h-full flex flex-col rounded-xl shadow-card border-2 border-white/30">
            <CardContent className="p-0 flex-1 relative">
                <InteractiveMap center={center} />

                <div className="absolute bottom-3 right-3">
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-md">
                        {thumbnails.map(thumb => (
                            <button 
                                key={thumb.id}
                                onClick={() => setActiveThumbId(thumb.id)}
                                className={cn(
                                    "rounded-lg overflow-hidden w-11 h-11 border-2 transition-all",
                                    activeThumbId === thumb.id ? "border-primary shadow-lg scale-105" : "border-transparent hover:border-primary/50"
                                )}
                            >
                                <Image
                                    src={thumb.imageUrl}
                                    width={44}
                                    height={44}
                                    alt={thumb.hint}
                                    data-ai-hint={thumb.hint}
                                    className="object-cover w-full h-full"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
