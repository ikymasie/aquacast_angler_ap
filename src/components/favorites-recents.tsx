
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Star } from "lucide-react";
import Link from "next/link";
import allSpotsData from "@/lib/locations.json";


const favoriteNames = ["Okavango Panhandle (Shakawe reach)", "Letsibogo Dam"];
const recentNames = ["Gaborone Dam", "Chobe River (Kasane)", "Thamalakane River (Maun)"];

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
    return <SpotList spots={spots} />;
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
