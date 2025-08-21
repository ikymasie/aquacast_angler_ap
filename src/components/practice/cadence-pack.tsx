
'use client';
import { Card } from '@/components/ui/card';

export function CadencePack() {
    return (
        <div className="h-full flex flex-col justify-center items-center text-center">
            <p className="text-sm text-muted-foreground">Target Cadence</p>
            <p className="font-headline text-6xl font-bold font-mono text-foreground">60</p>
            <p className="text-sm text-muted-foreground">SPM (±6)</p>
            <div className="mt-4 h-3 w-24 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="h-3 w-12 bg-primary rounded-full"></div>
            </div>
        </div>
    );
}
