
'use client';

import { Header } from '@/components/header';
import { SectionHeader } from '@/components/section-header';
import { FavoritesRecents } from '@/components/favorites-recents';

export function FavoritesTab() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-4 pb-24 overflow-y-auto">
        <SectionHeader title="Favorite Locations" />
        <FavoritesRecents tab="favorites" />
      </main>
    </>
  );
}
