
'use client';

import { Header } from '@/components/header';
import { MapCard } from '@/components/map-card';

export function MapsTab() {
  // Default to Gaborone if no specific location is selected
  const defaultCenter = { lat: -24.6545, lng: 25.9086 };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="w-full h-full rounded-xl overflow-hidden">
            <MapCard center={defaultCenter} />
        </div>
      </main>
    </>
  );
}
