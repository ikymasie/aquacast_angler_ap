
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
    
    useEffect(() => {
        // This is a guard. If a user lands on this page directly without
        // going through the setup flow (e.g., on a page refresh),
        // the activeDrill state will be null. In that case, we redirect them
        // home because the session context is lost.
        if (!activeDrill) {
            router.replace('/');
        }
    }, [activeDrill, router]);
    
    const handleExit = () => {
        clearActiveDrill();
        router.back();
    };
    
    // If activeDrill is not yet available, show a loading state.
    // The useEffect above will handle the redirect if it remains null.
    if (!activeDrill) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
                    <p className="text-center text-muted-foreground">Loading drill...</p>
                    <Skeleton className="w-full max-w-md h-[400px] rounded-xl mt-4" />
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
