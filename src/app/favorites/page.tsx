
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { SectionHeader } from '@/components/section-header';
import { FavoritesRecents } from '@/components/favorites-recents';

export default function FavoritesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-4 pb-24">
        <SectionHeader title="Favorite Locations" />
        <FavoritesRecents tab="favorites" />
      </main>
      <BottomNav />
    </div>
  );
}
