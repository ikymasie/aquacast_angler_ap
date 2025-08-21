
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, HelpCircle, Loader2, Dot, ArrowRight, Target } from 'lucide-react';

interface Requirement {
    key: string;
    label: string;
    valuePct?: number;
    targetPct?: number;
    value?: number;
    target?: number;
    status: 'met' | 'in_progress' | 'needs_attention';
}

interface RequirementsSheetProps {
  requirements: Requirement[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function RequirementsSheet({ requirements, isOpen, onOpenChange }: RequirementsSheetProps) {

  const handlePracticeNow = (req: Requirement) => {
    // Logic to start a specific practice drill
    console.log("Starting practice for:", req.key);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Rank Requirements</SheetTitle>
          <SheetDescription>Complete these challenges to advance to the next rank.</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-3">
            {requirements.map(req => (
                <div key={req.key} className="p-3 rounded-lg border bg-secondary/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-sm flex items-center gap-1.5">
                               {req.status === 'met' ? 
                                 <Check className="w-4 h-4 text-score-good" /> : 
                                 <Dot className="w-5 h-5 text-amber-500 -ml-1" />
                               }
                               {req.label}
                            </p>
                             <p className="text-xs text-muted-foreground ml-5">
                                {req.valuePct !== undefined ? `${req.valuePct}% / ${req.targetPct}%` : ''}
                                {req.value !== undefined ? `${req.value} / ${req.target}` : ''}
                            </p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8" onClick={() => handlePracticeNow(req)}>
                           <Target className="w-4 h-4 mr-2" />
                           Practice
                        </Button>
                    </div>
                </div>
            ))}
        </div>
        <SheetFooter className="pt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
