
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from '@/components/bottom-nav';
import { HomeTab } from '@/components/tabs/home-tab';
import { FavoritesTab } from '@/components/tabs/favorites-tab';
import { SearchTab } from '@/components/tabs/search-tab';
import { MapsTab } from '@/components/tabs/maps-tab';

const tabs: { [key: string]: React.ComponentType } = {
  home: HomeTab,
  favorites: FavoritesTab,
  search: SearchTab,
  maps: MapsTab,
};

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab: string) => {
    const currentIndex = Object.keys(tabs).indexOf(activeTab);
    const newIndex = Object.keys(tabs).indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const ActiveComponent = tabs[activeTab];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
