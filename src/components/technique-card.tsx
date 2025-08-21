
'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Target, Wind, Gauge, HardHat } from 'lucide-react';
import type { LureFamily } from '@/lib/types';
import { LureCrankSwimIcon } from './icons/lure-crank-swim';
import { LureLiveIcon } from './icons/lure-live';
import { LureSoftIcon } from './icons/lure-soft';
import { LureSpinnerIcon } from './icons/lure-spinner';

interface TechniqueCardProps {
  technique: {
    name: string;
    category: string;
    compatibleFamilies: LureFamily[];
    skillAxes: string[];
  };
}

const lureIcons: Record<string, React.FC<any>> = {
  'Crank/Swim': LureCrankSwimIcon,
  'Live': LureLiveIcon,
  'Soft': LureSoftIcon,
  'Spinner': LureSpinnerIcon,
};

const skillIcons: Record<string, React.ElementType> = {
    accuracy: Target,
    distance: Wind,
    precision: Target,
    cadence_consistency: Gauge,
    depth_control: Gauge,
    rigging: HardHat,
    default: Gauge,
}

export function TechniqueCard({ technique }: TechniqueCardProps) {

  const getLureIcon = (lureFamily: string) => {
    return lureIcons[lureFamily] || LureSoftIcon;
  };

  const getSkillIcon = (skill: string) => {
      const lowerSkill = skill.toLowerCase();
      for (const key in skillIcons) {
          if (lowerSkill.includes(key)) {
              return skillIcons[key];
          }
      }
      return skillIcons.default;
  }

  return (
    <Card className="p-3 rounded-xl shadow-sm border-line-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-headline text-base text-foreground">{technique.name}</h3>
            <div className="flex gap-1.5 flex-shrink-0 ml-2">
                {technique.compatibleFamilies.slice(0,3).map(lure => {
                    const Icon = getLureIcon(lure);
                    return <Icon key={lure} className="h-4 w-4 text-muted-foreground" />
                })}
            </div>
        </div>
        <Badge variant="secondary" className="mt-1 capitalize text-xs">{technique.category}</Badge>
      </div>

      <div className="mt-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Key Skills</h4>
        <div className="flex flex-wrap gap-1">
          {technique.skillAxes.map(skill => {
              const Icon = getSkillIcon(skill);
              return (
                   <Badge key={skill} variant="outline" className="text-xs font-medium py-0.5 px-1.5">
                      <Icon className="w-3 h-3 mr-1 text-primary" />
                      <span className="capitalize">{skill.replace(/_/g, ' ')}</span>
                  </Badge>
              )
          })}
        </div>
      </div>
    </Card>
  );
}
