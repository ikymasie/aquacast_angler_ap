
'use client';

import { Header } from '@/components/header';
import { PracticeTab } from '@/components/practice-tab';
import { SectionHeader } from '@/components/section-header';

export function ProgressTab() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 pb-24 overflow-y-auto space-y-4">
        <SectionHeader title="Progress" />
        <PracticeTab />
      </main>
    </>
  );
}
