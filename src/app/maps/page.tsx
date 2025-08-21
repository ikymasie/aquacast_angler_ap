
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { MapCard } from '@/components/map-card';

export default function MapsPage() {
  // Default to Gaborone if no specific location is selected
  const defaultCenter = { lat: -24.6545, lng: 25.9086 };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full h-full rounded-xl overflow-hidden">
            <MapCard center={defaultCenter} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
