
'use client';

import { Header } from '@/components/header';
import { PracticeTab } from '@/components/practice-tab';

export function ProgressTab() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 pb-24 overflow-y-auto">
        <PracticeTab />
      </main>
    </>
  );
}
