
'use client';

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const favorites = [
  { name: "Willow Creek Reservoir", photo: "https://placehold.co/160x100.png", hint: "lake sunset" },
  { name: "Tanglewood Lake", photo: "https://placehold.co/160x100.png", hint: "river forest" },
];

const recents = [
    { name: "Lake Harmony, PA", photo: "https://placehold.co/160x100.png", hint: "mountain lake" },
    { name: "Sunset Marina", photo: "https://placehold.co/160x100.png", hint: "marina boats" },
    { name: "Riverbend Park", photo: "https://placehold.co/160x100.png", hint: "creek rocks" },
];

const all_spots = [...favorites, ...recents];

export function LocationsRail() {
    const [activeTab, setActiveTab] = useState("recents");
    const spots = activeTab === 'favorites' ? favorites : activeTab === 'recents' ? recents : all_spots;
    
    return (
        <div>
            <div className="px-4">
                 <Tabs defaultValue="recents" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto">
                    <TabsTrigger value="all_spots" className={cn(
                        "h-9 rounded-full border px-4", 
                        activeTab === 'all_spots' ? 'bg-primary text-primary-foreground border-transparent' : 'border-line-300 text-ink-300'
                    )}>All</TabsTrigger>
                    <TabsTrigger value="recents" className={cn(
                        "h-9 rounded-full border px-4", 
                        activeTab === 'recents' ? 'bg-primary text-primary-foreground border-transparent' : 'border-line-300 text-ink-300'
                    )}>Recently</TabsTrigger>
                    <TabsTrigger value="favorites" className={cn(
                        "h-9 rounded-full border px-4", 
                        activeTab === 'favorites' ? 'bg-primary text-primary-foreground border-transparent' : 'border-line-300 text-ink-300'
                    )}>Favorites</TabsTrigger>
                  </TabsList>
                </Tabs>
            </div>
            <div className="mt-3 overflow-x-auto">
                <div className="flex space-x-3 px-4">
                    {spots.map((spot) => (
                        <div key={spot.name} className="relative rounded-lg overflow-hidden aspect-[16/10] group cursor-pointer flex-shrink-0 w-40">
                            <Image src={spot.photo} layout="fill" objectFit="cover" alt={spot.name} data-ai-hint={spot.hint} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-2">
                                <p className="text-white font-body text-caption drop-shadow-md">{spot.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
