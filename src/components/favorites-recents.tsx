
'use client';

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Star, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import allSpotsData from "@/lib/locations.json";
import { Button } from "./ui/button";
import { useEffect, useState, useTransition } from "react";
import { useUser } from "@/hooks/use-user";
import { getUserSpotsAction } from "@/app/actions";
import type { UserSpot } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

export function FavoritesRecents({ tab = 'all_spots' }: { tab?: 'all_spots' | 'recents' | 'favorites' }) {
    const { user } = useUser();
    const [userSpots, setUserSpots] = useState<UserSpot[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (user) {
            startTransition(async () => {
                const { data, error } = await getUserSpotsAction(user.uid);
                if (data) {
                    setUserSpots(data);
                }
                if (error) {
                    console.error("Failed to fetch user spots:", error);
                }
            });
        }
    }, [user, tab]);

    const staticSpots = allSpotsData.map(spot => ({ ...spot, isUserSpot: false, id: spot.name }));

    const allSpots = [
        ...staticSpots, 
        ...userSpots.map(spot => ({ ...spot, isUserSpot: true }))
    ].map(spot => ({
        ...spot,
        name: spot.name,
        photo: spot.image_url,
        hint: spot.waterbody_type.split(' ')[0].toLowerCase() + ' ' + spot.region,
        isFavorite: spot.isFavorite,
    }));

    const favorites = allSpots.filter(spot => spot.isFavorite);
    const recents = allSpots.filter(spot => spot.isRecent);

    const spotsToDisplay = tab === 'favorites' ? favorites : tab === 'recents' ? recents : allSpots;
    
    if (isPending) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[16/10] rounded-lg" />)}
            </div>
        )
    }

    if (tab !== 'all_spots' && spotsToDisplay.length === 0) {
        return <EmptyState tab={tab} />
    }

    return <SpotList spots={spotsToDisplay} />;
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

function SpotList({ spots }: { spots: { id: string; name: string, photo: string, hint: string, isFavorite?: boolean }[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {spots.map((spot) => (
                <Link href={`/spot-details?name=${encodeURIComponent(spot.name)}`} key={spot.id} className="relative rounded-lg overflow-hidden aspect-[16/10] group cursor-pointer">
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
