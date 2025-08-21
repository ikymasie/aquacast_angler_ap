
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../section-header';
import { Badge } from '../ui/badge';


const MOCK_QUESTS = [
  { label: "Hit 80% quiet-entry in a Soft Skip drill", isComplete: true },
  { label: "Practice with 2 different species in one day", isComplete: true },
  { label: "Run an Edge Lane drill in wind > 8 kph", isComplete: false },
];

export function QuestsCard() {
  return (
    <Card className="rounded-xl p-4 space-y-4">
      <SectionHeader title="Weekly Quests" />
      <div className="space-y-2">
        {MOCK_QUESTS.map((quest, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle className={`w-5 h-5 ${quest.isComplete ? 'text-score-good' : 'text-muted-foreground'}`} />
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
