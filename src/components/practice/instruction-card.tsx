
'use client';

import { Card } from '@/components/ui/card';
import { Lightbulb, Target } from 'lucide-react';

interface InstructionCardProps {
  templates: {
    biteConsiderations?: string[];
    possibleStrategies?: string[];
    insights?: string[];
  };
}

export function InstructionCard({ templates }: InstructionCardProps) {
  const instructions = templates.possibleStrategies;
  const considerations = templates.biteConsiderations;

  if (!instructions && !considerations) {
    return null;
  }
  
  const itemsToDisplay = instructions || considerations;
  const title = instructions ? "How to Practice" : "Key Considerations";
  const Icon = instructions ? Target : Lightbulb;

  return (
    <Card className="p-4 rounded-xl bg-secondary/70 border-line-200">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <h4 className="font-semibold text-muted-foreground text-sm">{title}</h4>
      </div>
      <ul className="space-y-1.5 text-sm text-foreground/90 pl-3">
        {itemsToDisplay?.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
             <span className="text-muted-foreground mt-1">•</span>
             <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
