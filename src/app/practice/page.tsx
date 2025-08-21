
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LivePracticeHUD } from '@/components/practice/live-practice-hud';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';

function PracticePageContent() {
    const router = useRouter();
    const [drill, setDrill] = useState<any | null>(null);

    useEffect(() => {
        // On component mount, try to read the drill state from sessionStorage.
        const drillDataString = sessionStorage.getItem('currentDrill');
        if (drillDataString) {
            try {
                const drillData = JSON.parse(drillDataString);
                setDrill(drillData);
                // Clean up the session storage after use
                sessionStorage.removeItem('currentDrill');
            } catch (error) {
                console.error("Failed to parse drill data from sessionStorage", error);
                router.replace('/');
            }
        } else {
             // If state isn't available, it suggests a direct navigation or a bug.
             // For now, redirecting home is a safe fallback.
             console.warn("No drill data found in sessionStorage, redirecting home.");
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
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <main className="flex-1 p-4 md:p-6 pb-24">
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
