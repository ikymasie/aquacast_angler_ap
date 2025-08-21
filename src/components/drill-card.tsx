
'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play } from 'lucide-react';
import allTechniques from '@/lib/practice-catalog.json';

interface DrillCardProps {
  drill: {
    name: string;
    description: string;
    techniques: string[];
  };
}

export function DrillCard({ drill }: DrillCardProps) {
  const getTechniqueName = (key: string) => {
    return allTechniques.techniqueCatalog.find(t => t.techniqueKey === key)?.name || key;
  };

  return (
    <Card className="p-4 rounded-xl flex items-center justify-between shadow-card border-0 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div>
        <h3 className="font-headline text-xl">{drill.name}</h3>
        <p className="text-white/80 text-sm max-w-xs mt-1">{drill.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
            {drill.techniques.map(techKey => (
                <div key={techKey} className="text-xs font-medium bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {getTechniqueName(techKey)}
                </div>
            ))}
        </div>
      </div>
      <Button size="icon" className="h-12 w-12 flex-shrink-0 bg-white/25 hover:bg-white/30 active:bg-white/40 rounded-full">
        <Play className="h-6 w-6 text-white" />
      </Button>
    </Card>
  );
}

    