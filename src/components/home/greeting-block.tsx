
'use client';

import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";

export function GreetingBlock() {
    const { user, isLoading } = useUser();
    
    if (isLoading && !user) {
        return (
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>
        )
    }

    return (
        <div>
             <h1 className="font-headline text-h1 font-bold text-ink-900">Hello {user?.displayName || 'Angler'}</h1>
             <p className="font-body text-body text-ink-700">Here's your personalized fishing forecast.</p>
        </div>
    )
}
