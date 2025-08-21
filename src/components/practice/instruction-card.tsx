
'use client';

import { Card } from '@/components/ui/card';
import { Lightbulb, Target } from 'lucide-react';
import { Separator } from '../ui/separator';

interface InstructionCardProps {
  templates: {
    biteConsiderations?: string[];
    possibleStrategies?: string[];
    insights?: string[];
  };
}

function InstructionSection({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: string[] }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold text-muted-foreground text-sm">{title}</h4>
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/90 pl-3">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function InstructionCard({ templates }: InstructionCardProps) {
  const strategies = templates.possibleStrategies;
  const considerations = templates.biteConsiderations;

  if (!strategies && !considerations) {
    return null;
  }

  return (
    <Card className="p-4 rounded-xl bg-secondary/70 border-line-200 space-y-4">
      {strategies && strategies.length > 0 && (
        <InstructionSection 
            title="How to Practice"
            icon={Target}
            items={strategies}
        />
      )}
      {strategies && strategies.length > 0 && considerations && considerations.length > 0 && (
        <Separator className="my-2 bg-black/10" />
      )}
      {considerations && considerations.length > 0 && (
         <InstructionSection 
            title="Why It Matters"
            icon={Lightbulb}
            items={considerations}
        />
      )}
    </Card>
  );
}
