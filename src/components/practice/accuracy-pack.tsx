
'use client';

import { Card } from '@/components/ui/card';

export function AccuracyPack() {
    return (
        <Card className="p-4 rounded-xl">
            <TargetCard />
            <RingDiagram />
        </Card>
    );
}

function TargetCard() {
    return (
        <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-2xl font-bold">15m at 45°</p>
            <p className="text-xs text-muted-foreground">Crosswind</p>
        </div>
    );
}

function RingDiagram() {
    return (
        <div className="relative w-40 h-40 mx-auto">
            <div className="absolute inset-0 rounded-full bg-red-500/20"></div>
            <div className="absolute inset-[25%] rounded-full bg-yellow-500/30"></div>
            <div className="absolute inset-[37.5%] rounded-full bg-green-500/40"></div>
        </div>
    );
}
