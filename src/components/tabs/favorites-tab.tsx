
'use client';

import { Header } from '@/components/header';
import { SectionHeader } from '@/components/section-header';
import { FavoritesRecents } from '@/components/favorites-recents';
import { useUser } from '@/hooks/use-user';
import { useEffect, useState } from 'react';

export function FavoritesTab() {
  const { user } = useUser();
  // Add a key to force re-render when the user changes or a favorite is toggled.
  const [componentKey, setComponentKey] = useState(0);

  useEffect(() => {
    // This is a simple way to listen for an event that might indicate a change in favorites.
    // A more robust solution might use a global state manager like Zustand or context.
    const handleFavoritesChange = () => {
      setComponentKey(prev => prev + 1);
    };

    window.addEventListener('favorites-changed', handleFavoritesChange);
    return () => {
      window.removeEventListener('favorites-changed', handleFavoritesChange);
    };
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-4 pb-24 overflow-y-auto">
        <SectionHeader title="Favorite Locations" />
        <FavoritesRecents key={componentKey} tab="favorites" />
      </main>
    </>
  );
}
