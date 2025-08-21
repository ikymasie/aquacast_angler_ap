
'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Target, Wind, Gauge, HardHat } from 'lucide-react';

interface TechniqueCardProps {
  technique: {
    label: string;
    skillAxes: string[];
  };
}

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
    <Card className="p-3 rounded-xl shadow-sm border-line-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-headline text-base text-foreground">{technique.label}</h3>
        </div>
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
