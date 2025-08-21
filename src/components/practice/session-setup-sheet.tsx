
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
import { Separator } from '@/components/ui/separator';
import { TechniqueCard } from '../technique-card';
import { Play } from 'lucide-react';

interface SessionSetupSheetProps {
  drill: any;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onBegin: () => void;
}

export function SessionSetupSheet({ drill, isOpen, onOpenChange, onBegin }: SessionSetupSheetProps) {
  if (!drill) return null;

  const relevantTechniques = drill.techniques || [];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">{drill.name}</SheetTitle>
          <SheetDescription>{drill.ui?.whatYouLearn || 'Prepare for your practice session.'}</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Parameters</h4>
                 <div className="flex flex-wrap gap-2">
                     <Badge variant="outline">Rounds: {drill.params.rounds}</Badge>
                     <Badge variant="outline">Casts/Round: {drill.params.castsPerRound || 'N/A'}</Badge>
                     <Badge variant="outline">Difficulty: {'★'.repeat(drill.difficulty || 1).padEnd(3, '☆')}</Badge>
                </div>
            </div>
            <Separator />
             <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Focus Techniques</h4>
                 <p className="text-xs text-muted-foreground">This drill will test your ability in the following techniques.</p>
                {/* We would need to look up full technique objects from a catalog */}
                <div className="grid grid-cols-2 gap-2">
                    {relevantTechniques.map((techKey: string) => (
                        <Badge key={techKey} variant="secondary" className="capitalize justify-center py-1">{techKey.replace(/_/g, ' ')}</Badge>
                    ))}
                </div>
            </div>
             <Separator />
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Pro Tip</h4>
                <p className="text-sm text-foreground italic">
                    "{drill.ui?.proTip || 'Keep your casts low and controlled to cut through the wind.'}"
                </p>
            </div>
        </div>
        <SheetFooter className="pt-4">
          <Button onClick={onBegin} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Begin Drill
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
