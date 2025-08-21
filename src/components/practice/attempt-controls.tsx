
'use client';

import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';

interface AttemptControlsProps {
    round: number;
    attempt: number;
    onLog: () => void;
    onMiss: () => void;
    onUndo: () => void;
    canUndo: boolean;
}

export function AttemptControls({ round, attempt, onLog, onMiss, onUndo, canUndo }: AttemptControlsProps) {
    const totalCasts = 10; // Should come from drill params
    const totalRounds = 3;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-panel/80 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-md mx-auto">
                <p className="text-xs text-center text-white/60 mb-1">Cast {attempt}/{totalCasts} • R{round}/{totalRounds}</p>
                <div className="grid grid-cols-5 gap-2 items-center">
                    <Button variant="outline" className="col-span-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={onMiss}>No Luck</Button>
                    <Button onClick={onLog} className="col-span-3 h-12 text-base font-semibold">It Worked</Button>
                    <Button variant="ghost" size="icon" className="col-span-1 h-12 w-12 text-white hover:text-white hover:bg-white/10" onClick={onUndo} disabled={!canUndo}>
                        <Undo className="w-5 h-5"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
