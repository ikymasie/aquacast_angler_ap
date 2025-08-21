
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Flame } from 'lucide-react';

const gradeBands: Record<string, string> = {
    'S': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    'A': 'bg-score-good text-white',
    'B': 'bg-score-fair text-foreground',
    'C': 'bg-score-fair-slow text-white',
    'D': 'bg-score-poor text-white',
}

interface GradeAndRewardsProps {
    grade: string;
    rewards: {
        xp: number;
        coins: number;
        streakDelta?: number;
    }
}

export function GradeAndRewards({ grade, rewards }: GradeAndRewardsProps) {
    const gradeClass = gradeBands[grade] || 'bg-muted text-muted-foreground';

    return (
        <Card className="p-3 rounded-xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
                <Badge className={`w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-lg ${gradeClass}`}>
                    {grade}
                </Badge>
                <div>
                    <p className="font-semibold">Grade</p>
                    <p className="text-xs text-muted-foreground">Overall performance</p>
                </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">+{rewards.xp}</span>
                    <span className="text-muted-foreground">XP</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-foreground">+{rewards.coins}</span>
                </div>
                {rewards.streakDelta && rewards.streakDelta > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-destructive" />
                        <span className="font-bold text-foreground">+{rewards.streakDelta}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}

