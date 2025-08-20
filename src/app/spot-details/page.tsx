
'use client';

import { Suspense, useState } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { SpotHeaderCard } from '@/components/spot-header-card';
import { MapCard } from '@/components/map-card';
import { SpeciesVerticalSelector } from '@/components/species-vertical-selector';
import type { Species } from '@/lib/types';
import allSpotsData from "@/lib/locations.json";
import { FishingSuccessCard } from '@/components/fishing-success-card';


export default function SpotDetailsPage() {
    const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
    
    // Mock data for the page based on the first spot in the JSON
    const spot = allSpotsData[0];
    const speciesList = [
        { id: 'Bass', name: 'Bass', imageUrl: '/icons/fish-bass-solid.svg' },
        { id: 'Bream', name: 'Bream', imageUrl: '/icons/fish-bream-solid.svg' },
        { id: 'Carp', name: 'Carp', imageUrl: '/icons/fish-carp-solid.svg' },
        { id: 'Tigerfish', name: 'Tigerfish', imageUrl: '/icons/fish-tiger-solid.svg' },
        { id: 'Catfish', name: 'Catfish', imageUrl: '/icons/fish-catfish-solid.svg' },
    ];
     const mapThumbnails = [
        { id: 'map', imageUrl: 'https://placehold.co/100x100.png?text=Map', hint: 'map view' },
        { id: 'photo1', imageUrl: 'https://placehold.co/100x100.png', hint: 'fishing spot photo' },
        { id: 'photo2', imageUrl: 'https://placehold.co/100x100.png', hint: 'lake view' },
    ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <Header/>
        <main className="flex-1 p-4 md:p-6 space-y-4 pb-24">
            <Suspense fallback={<div>Loading...</div>}>
               <SpotHeaderCard spot={spot} />
               <FishingSuccessCard />
            </Suspense>
        </main>
        <BottomNav />
    </div>
  );
}
