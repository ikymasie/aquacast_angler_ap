
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../section-header';
import { Skeleton } from '../ui/skeleton';

interface Quest {
    label: string;
    isComplete: boolean;
}

interface QuestsCardProps {
    quests: Quest[];
    isLoading: boolean;
}


export function QuestsCard({ quests, isLoading }: QuestsCardProps) {
  
  if (isLoading) {
      return (
          <Card className="rounded-xl p-4 space-y-4">
              <SectionHeader title="Weekly Quests" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
          </Card>
      )
  }

  return (
    <Card className="rounded-xl p-4 space-y-4">
      <SectionHeader title="Weekly Quests" />
      <div className="space-y-2">
        {quests.map((quest, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle className={`w-5 h-5 flex-shrink-0 ${quest.isComplete ? 'text-score-good' : 'text-muted-foreground/50'}`} />
            <span className={quest.isComplete ? 'text-foreground' : 'text-muted-foreground'}>
              {quest.label}
            </span>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full">
        Start Suggested Drill
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
}
