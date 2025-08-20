
'use client';

import Image from "next/image";
import Link from 'next/link';
import allSpotsData from "@/lib/locations.json";


// For demo purposes, we'll manually assign some spots to favorites and recents.
// In a real app, this would come from user data.
const all_spots = allSpotsData.map(spot => ({
    name: spot.name,
    photo: spot.image_url,
    hint: spot.waterbody_type.split(' ')[0].toLowerCase() + ' ' + spot.region,
}));


export function LocationsRail() {
    return (
        <div className="overflow-x-auto">
            <div className="flex space-x-3 px-4">
                {all_spots.map((spot) => (
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
    )
}
