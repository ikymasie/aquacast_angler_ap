
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
        const state = window.history.state;
        if (state && state.drill) {
            setDrill(state.drill);
        } else {
            // If there's no drill data, the user likely landed here directly.
            // Redirect them back to the home page or a more appropriate page.
            router.replace('/');
        }
    }, [router]);

    const handleExit = () => {
        router.back();
    };

    if (!drill) {
        // You can render a loading state or a skeleton component here.
        return (
             <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="flex-1 p-4 md:p-6">
                    <Skeleton className="w-full h-[400px] rounded-xl" />
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
