
'use client';

import { Card } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SkillData {
    skill: string;
    A: number;
    fullMark: number;
}

interface SkillWheelProps {
    data: SkillData[];
}


export function SkillWheel({ data }: SkillWheelProps) {
  return (
    <Card className="rounded-xl shadow-sm border-line-200 p-4">
        <h3 className="font-headline text-lg mb-2">Skill Radar (30-day)</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
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
