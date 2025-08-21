
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LivePracticeHUD } from '@/components/practice/live-practice-hud';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { useUser } from '@/hooks/use-user';

// This component is not directly used but helps illustrate the expected structure.
// The logic will be handled in the new /practice/page.tsx for now.
export default function PracticeDrillPage() {
    const router = useRouter();
    const params = useParams();
    const drillKey = params.drillKey as string;
    const { user } = useUser();
    const [drill, setDrill] = useState<any | null>(null);

    // In a real scenario, you'd fetch drill data using the drillKey.
    // For now, this is a placeholder. If a user lands here directly,
    // we can redirect them or show a "drill not found" message.
     useEffect(() => {
        // This effect runs on the client-side after the component mounts.
        // The drill data is expected to be in the navigation state.
        if (typeof window !== 'undefined' && window.history.state && window.history.state.drill) {
            setDrill(window.history.state.drill);
        } else {
             // In a real app, you might fetch the drill data here if it's not in the state.
             // For now, we'll just wait for it. If the user navigated directly, they'll see a loading state.
             // If no drill data is found after a short period, redirect.
            const timer = setTimeout(() => {
                if (!window.history.state?.drill) {
                    console.warn("No drill data found in state, redirecting home.");
                    router.replace('/');
                }
            }, 500); // Wait 500ms before redirecting
            return () => clearTimeout(timer);
        }
    }, [router]);

    const handleExit = () => {
        router.back();
    };
    
    if (!drill) {
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
                <LivePracticeHUD drill={drill} onExit={handleExit} />
            </main>
        </div>
    );
}
