
'use client';

import { Card } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const MOCK_SKILLS = [
  { skill: 'Accuracy', A: 74, fullMark: 100 },
  { skill: 'Quiet Entry', A: 71, fullMark: 100 },
  { skill: 'Cadence', A: 66, fullMark: 100 },
  { skill: 'Lane/Edge', A: 58, fullMark: 100 },
  { skill: 'Distance', A: 69, fullMark: 100 },
  { skill: 'Grouping', A: 57, fullMark: 100 },
  { skill: 'Timing', A: 63, fullMark: 100 },
];

export function SkillWheel() {
  return (
    <Card className="rounded-xl shadow-sm border-line-200 p-4">
        <h3 className="font-headline text-lg mb-2">Skill Radar (30-day)</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_SKILLS}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                        dataKey="skill" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={false} 
                        axisLine={false}
                    />
                    <Radar 
                        name="Mike" 
                        dataKey="A" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.25} 
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    </Card>
  );
}
