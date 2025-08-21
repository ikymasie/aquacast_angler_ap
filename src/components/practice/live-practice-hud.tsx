
'use client';

import { AccuracyPack } from './accuracy-pack';
import { AttemptControls } from './attempt-controls';
import { CadencePack } from './cadence-pack';
import { Progress } from '@/components/ui/progress';
import { Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LivePracticeHUD() {
    // This would be driven by drill type state
    const drillType = 'accuracy'; 

    return (
        <div className="bg-secondary p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-xs font-semibold">Round 1/3, Cast 1/10</p>
                    <Progress value={10} className="h-2 mt-1" />
                </div>
                <Button size="icon" variant="ghost">
                    <Pause className="w-5 h-5"/>
                </Button>
            </div>

            {drillType === 'accuracy' && <AccuracyPack />}
            {drillType === 'cadence' && <CadencePack />}
            
            <AttemptControls />
        </div>
    );
}
