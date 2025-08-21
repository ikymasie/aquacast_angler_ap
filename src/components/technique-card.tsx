
'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Target, Wind, Gauge } from 'lucide-react';
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
    <Card className="p-4 rounded-xl shadow-sm border-line-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-headline text-lg text-foreground">{technique.name}</h3>
          <Badge variant="secondary" className="mt-1 capitalize">{technique.category}</Badge>
        </div>
        <div className="flex gap-1.5">
            {technique.compatibleFamilies.slice(0,3).map(lure => {
                const Icon = getLureIcon(lure);
                return <Icon key={lure} className="h-5 w-5 text-muted-foreground" />
            })}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Key Skills</h4>
        {technique.skillAxes.map(skill => {
            const Icon = getSkillIcon(skill);
            return (
                 <div key={skill} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground capitalize">{skill.replace(/_/g, ' ')}</span>
                </div>
            )
        })}
      </div>
    </Card>
  );
}

    