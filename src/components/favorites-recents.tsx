

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Star, Plus } from "lucide-react";
import Link from "next/link";
import allSpotsData from "@/lib/locations.json";
import { Button } from "./ui/button";


const favoriteNames: string[] = []; // No favorites by default
const recentNames: string[] = []; // No recents by default

const all_spots = allSpotsData.map(spot => ({
    name: spot.name,
    photo: spot.image_url,
    hint: spot.waterbody_type.split(' ')[0].toLowerCase() + ' ' + spot.region,
    isFavorite: favoriteNames.includes(spot.name),
}));

const favorites = all_spots.filter(spot => spot.isFavorite);
const recents = allSpotsData.filter(spot => recentNames.includes(spot.name)).map(spot => ({
    name: spot.name,
    photo: spot.image_url,
    hint: spot.waterbody_type.split(' ')[0].toLowerCase() + ' ' + spot.region,
    isFavorite: favoriteNames.includes(spot.name),
}));


export function FavoritesRecents({ tab = 'all_spots' }: { tab?: 'all_spots' | 'recents' | 'favorites' }) {
    const spots = tab === 'favorites' ? favorites : tab === 'recents' ? recents : all_spots;
    
    if (tab !== 'all_spots' && spots.length === 0) {
        return <EmptyState tab={tab} />
    }

    return <SpotList spots={spots} />;
}

function EmptyState({ tab }: { tab: 'recents' | 'favorites' }) {
    const message = tab === 'favorites' 
        ? "You haven't added any favorite spots yet. Star a spot to see it here."
        : "You haven't viewed any spots recently.";

    return (
        <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-foreground">No {tab} spots</h3>
            <p className="text-muted-foreground mt-2 text-sm">{message}</p>
             <Button asChild className="mt-4">
                <Link href="/add-spot">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Spot
                </Link>
            </Button>
        </div>
    )
}

function SpotList({ spots }: { spots: { name: string, photo: string, hint: string, isFavorite: boolean }[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {spots.map((spot) => (
                <Link href="/spot-details" key={spot.name} className="relative rounded-lg overflow-hidden aspect-[16/10] group cursor-pointer">
                    <Image src={spot.photo} layout="fill" objectFit="cover" alt={spot.name} data-ai-hint={spot.hint} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3">
                        <p className="text-white font-semibold text-sm drop-shadow-md">{spot.name}</p>
                    </div>
                    {spot.isFavorite && (
                        <div className="absolute top-2 right-2">
                            <Star className="w-5 h-5 text-white fill-amber-400"/>
                        </div>
                    )}
                </Link>
            ))}
        </div>
    )
}
