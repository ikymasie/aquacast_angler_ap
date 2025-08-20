
'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SpeciesItem {
    id: string;
    name: string;
    imageUrl: string;
}

interface SpeciesVerticalSelectorProps {
    items: SpeciesItem[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export function SpeciesVerticalSelector({ items, selectedId, onSelect }: SpeciesVerticalSelectorProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: 'up' | 'down') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'up' ? -80 : 80; // Height of one item (72) + gap (8)
            scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative w-full md:w-[112px] h-[260px]">
             <button 
                onClick={() => handleScroll('up')}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Scroll up"
            >
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
            </button>
            <div 
                ref={scrollContainerRef}
                className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar flex flex-row md:flex-col gap-2 py-10"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                }}
            >
                {items.map(item => (
                    <Card
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={cn(
                            'w-full md:w-[112px] h-[72px] flex-shrink-0 p-2 flex flex-col items-center justify-center cursor-pointer transition-all snap-start',
                            'border shadow-sm hover:shadow-card hover:scale-105 active:scale-95',
                            selectedId === item.id 
                                ? 'border-primary ring-2 ring-primary/50 ring-offset-background' 
                                : 'border-border'
                        )}
                    >
                        <div className="relative h-7 w-full">
                           <Image 
                                src={item.imageUrl} 
                                alt={item.name} 
                                layout="fill"
                                objectFit="contain"
                           />
                        </div>
                        <p className="mt-1 text-xs font-medium text-center text-foreground">{item.name}</p>
                    </Card>
                ))}
            </div>
             <button 
                onClick={() => handleScroll('down')}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Scroll down"
            >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
             <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
