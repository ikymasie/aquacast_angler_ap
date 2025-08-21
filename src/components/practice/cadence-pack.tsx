
'use client';
import { Card } from '@/components/ui/card';

export function CadencePack() {
    return (
        <Card className="p-4 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">Target Cadence</p>
            <p className="text-5xl font-bold font-mono">60</p>
            <p className="text-xs text-muted-foreground">SPM (±6)</p>
        </Card>
    );
}
