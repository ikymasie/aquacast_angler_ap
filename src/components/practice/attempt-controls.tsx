
'use client';

import { Button } from '@/components/ui/button';
import { Undo, Fish } from 'lucide-react';

interface AttemptControlsProps {
    round: number;
    attempt: number;
    onLog: () => void;
    onMiss: () => void;
    onFishCaught: () => void;
    onUndo: () => void;
    canUndo: boolean;
}

export function AttemptControls({ round, attempt, onLog, onMiss, onFishCaught, onUndo, canUndo }: AttemptControlsProps) {
    const totalCasts = 10; // Should come from drill params
    const totalRounds = 3;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-panel/80 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-md mx-auto">
                <p className="text-xs text-center text-white/60 mb-1">Cast {attempt}/{totalCasts} • R{round}/{totalRounds}</p>
                <div className="grid grid-cols-6 gap-2 items-center">
                    <Button variant="outline" className="col-span-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={onMiss}>Miss</Button>
                    <Button onClick={onLog} variant="secondary" className="col-span-2 h-12 text-base font-semibold">Done</Button>
                     <Button onClick={onFishCaught} className="col-span-2 h-12 text-base font-semibold bg-score-good hover:bg-score-good/90">
                        <Fish className="w-5 h-5 mr-2" />
                        Caught!
                    </Button>
                    <Button variant="ghost" size="icon" className="col-span-1 h-12 w-12 text-white hover:text-white hover:bg-white/10" onClick={onUndo} disabled={!canUndo}>
                        <Undo className="w-5 h-5"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
