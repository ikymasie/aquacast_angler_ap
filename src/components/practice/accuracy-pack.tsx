
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind } from 'lucide-react';

export function AccuracyPack() {
    return (
        <div className="h-full flex flex-col justify-between">
            <TargetCard />
            <RingDiagram />
            <div className="text-center">
                 <Badge variant="secondary" className="bg-secondary">
                    <Wind className="w-3 h-3 mr-1.5"/>
                    Upwind
                </Badge>
            </div>
        </div>
    );
}

function TargetCard() {
    return (
        <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="font-headline text-3xl font-bold text-foreground">15m at 45°</p>
            <p className="text-xs text-muted-foreground">Radius: 45cm</p>
        </div>
    );
}

function RingDiagram() {
    return (
        <div className="relative w-48 h-48 mx-auto my-4">
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#FF7A704D' }}></div>
            <div className="absolute inset-[25%] rounded-full" style={{ backgroundColor: '#FFD66666' }}></div>
            <div className="absolute inset-[37.5%] rounded-full" style={{ backgroundColor: '#7BD38999' }}></div>
             <div className="absolute inset-[46.5%] rounded-full" style={{ backgroundColor: '#26C6DA' }}></div>
        </div>
    );
}
