
'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play } from 'lucide-react';
import type { LureFamily } from '@/lib/types';
import { LureCrankSwimIcon } from './icons/lure-crank-swim';
import { LureLiveIcon } from './icons/lure-live';
import { LureSoftIcon } from './icons/lure-soft';
import { LureSpinnerIcon } from './icons/lure-spinner';

interface DrillCardProps {
  drill: {
    name: string;
    requiredFamilies: LureFamily[];
    techniques: string[];
  };
}

const lureIcons: Record<string, React.FC<any>> = {
  'Crank/Swim': LureCrankSwimIcon,
  'Live': LureLiveIcon,
  'Soft': LureSoftIcon,
  'Spinner': LureSpinnerIcon,
};


export function DrillCard({ drill }: DrillCardProps) {
  
  const getLureIcon = (lureFamily: string) => {
    return lureIcons[lureFamily] || LureSoftIcon;
  };

  return (
    <Card className="p-4 rounded-xl shadow-sm border-line-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-headline text-lg text-foreground">{drill.name}</h3>
            <div className="flex gap-1.5">
                {drill.requiredFamilies.slice(0,3).map(lure => {
                    const Icon = getLureIcon(lure);
                    return <Icon key={lure} className="h-5 w-5 text-muted-foreground" />
                })}
            </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
            {drill.techniques.map(tech => (
                <Badge key={tech} variant="outline" className="text-xs capitalize">{tech.replace(/_/g, ' ')}</Badge>
            ))}
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button size="sm">
            <Play className="w-4 h-4 mr-2"/>
            Start Drill
        </Button>
      </div>
    </Card>
  );
}

    