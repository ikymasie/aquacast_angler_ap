
'use client';

import { useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import allSpotsData from "@/lib/locations.json";

// For demo purposes, we'll manually assign some spots to favorites and recents.
// In a real app, this would come from user data.
const favoriteNames = ["Okavango Panhandle (Shakawe reach)", "Letsibogo Dam"];
const recentNames = ["Gaborone Dam", "Chobe River (Kasane)", "Thamalakane River (Maun)"];

const all_spots = allSpotsData.map(spot => ({
    name: spot.name,
    photo: spot.image_url,
    hint: spot.waterbody_type.split(' ')[0].toLowerCase() + ' ' + spot.region,
    isFavorite: favoriteNames.includes(spot.name),
    isRecent: recentNames.includes(spot.name),
}));

const favorites = all_spots.filter(spot => spot.isFavorite);
const recents = all_spots.filter(spot => spot.isRecent);

export function LocationsRail() {
    const [activeTab, setActiveTab] = useState("all_spots");
    
    const getSpots = () => {
        switch(activeTab) {
            case 'favorites': return favorites;
            case 'recents': return recents;
            default: return all_spots;
        }
    }
    
    const spots = getSpots();
    
    return (
        <div>
            <div className="px-4">
                 <Tabs defaultValue="all_spots" onValueChange={setActiveTab} className="w-full">
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
                        <Link href="/spot-details" key={spot.name} className="relative rounded-lg overflow-hidden aspect-[16/10] group cursor-pointer flex-shrink-0 w-40">
                            <Image src={spot.photo} layout="fill" objectFit="cover" alt={spot.name} data-ai-hint={spot.hint} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-2">
                                <p className="text-white font-body text-caption drop-shadow-md">{spot.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
