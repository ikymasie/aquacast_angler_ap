
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind } from 'lucide-react';

interface AccuracyPackProps {
    drill: any;
}

export function AccuracyPack({ drill }: AccuracyPackProps) {
    const params = drill.params || {};
    const target = params.targets?.[0] || { distance_m: 15, radius_cm: 45 };
    const windHint = params.windHint_kph ? `Upwind ${params.windHint_kph[0]}-${params.windHint_kph[1]}kph` : 'Upwind';

    return (
        <div className="h-full flex flex-col justify-between">
            <TargetCard 
                distance={target.distance_m}
                radius={target.radius_cm}
            />
            <RingDiagram />
            <div className="text-center">
                 <Badge variant="secondary" className="bg-secondary">
                    <Wind className="w-3 h-3 mr-1.5"/>
                    {windHint}
                </Badge>
            </div>
        </div>
    );
}

function TargetCard({ distance, radius, angle = 45 }: { distance: number, radius: number, angle?: number }) {
    return (
        <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="font-headline text-3xl font-bold text-foreground">{distance}m at {angle}°</p>
            <p className="text-xs text-muted-foreground">Radius: {radius}cm</p>
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
