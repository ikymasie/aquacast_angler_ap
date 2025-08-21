
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LivePracticeHUD } from '@/components/practice/live-practice-hud';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { useUser } from '@/hooks/use-user';
import { usePracticeState } from '@/hooks/use-practice-state';

export default function PracticeDrillPage() {
    const router = useRouter();
    const { activeDrill, clearActiveDrill } = usePracticeState();
    
    const handleExit = () => {
        clearActiveDrill();
        router.back();
    };
    
    if (!activeDrill) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="flex-1 p-4 md:p-6">
                    <p className="text-center text-muted-foreground">Loading drill...</p>
                    <Skeleton className="w-full h-[400px] rounded-xl mt-4" />
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <main className="flex-1 p-4 md:p-6 pb-24">
                <LivePracticeHUD drill={activeDrill} onExit={handleExit} />
            </main>
        </div>
    );
}
