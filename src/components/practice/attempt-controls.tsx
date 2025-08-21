
'use client';

import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';

export function AttemptControls() {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-line-200">
            <div className="max-w-md mx-auto">
                <p className="text-xs text-center text-muted-foreground mb-1">Cast 1/10 • R1/3</p>
                <div className="grid grid-cols-5 gap-2 items-center">
                    <Button variant="outline" className="col-span-1 h-12">Miss</Button>
                    <Button className="col-span-3 h-12 text-base font-semibold">Log Outcome</Button>
                    <Button variant="ghost" size="icon" className="col-span-1 h-12 w-12">
                        <Undo className="w-5 h-5"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
