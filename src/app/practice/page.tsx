
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LivePracticeHUD } from '@/components/practice/live-practice-hud';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';

function PracticePageContent() {
    const router = useRouter();
    const [drill, setDrill] = useState<any | null>(null);

    useEffect(() => {
        // This effect runs on the client-side after the component mounts.
        // The drill data is expected to be in the navigation state.
        if (window.history.state && window.history.state.drill) {
            setDrill(window.history.state.drill);
        } else {
            // If state is not found, it's safer to redirect back
            // This could happen on a page refresh.
            console.warn("No drill data found in history state. Redirecting.");
            router.replace('/');
        }
    }, [router]);

    const handleExit = () => {
        router.back();
    };

    if (!drill) {
        // Render a loading state while waiting for the drill data from navigation state.
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
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 md:p-6">
                <LivePracticeHUD drill={drill} onExit={handleExit} />
            </main>
        </div>
    );
}


export default function PracticePage() {
    return (
        <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
            <PracticePageContent />
        </Suspense>
    );
}
