
'use client';
import { Button } from '@/components/ui/button';

export function AttemptControls() {
    return (
        <div className="grid grid-cols-3 gap-2 p-2">
            <Button variant="outline">Miss</Button>
            <Button>Log Outcome</Button>
            <Button variant="ghost">Undo</Button>
        </div>
    );
}
