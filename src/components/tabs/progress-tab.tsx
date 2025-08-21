
'use client';

import { Header } from '@/components/header';
import { RankingsList } from '@/components/progress/rankings-list';
import { SectionHeader } from '@/components/section-header';

export function ProgressTab() {
  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 pb-24 overflow-y-auto space-y-4">
        <SectionHeader title="Angler Rankings" />
        <p className="text-sm text-muted-foreground">See how you stack up against other anglers. Complete drills to improve your rank.</p>
        <RankingsList />
      </main>
    </>
  );
}
