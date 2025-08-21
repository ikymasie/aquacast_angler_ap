
'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Star, Shield } from 'lucide-react';

export function SessionHeader() {
  const level = 6;
  const xp = 1250;
  const nextLevelXp = 2000;
  const progress = (xp / nextLevelXp) * 100;
  const streak = 3;
  const coins = 1450;

  return (
    <Card className="rounded-xl p-4 shadow-sm border-line-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="font-bold text-lg text-primary">{level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background p-0.5 rounded-full">
               <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Level {level}</p>
            <Progress value={progress} className="h-2 mt-1" />
            <p className="text-xs text-muted-foreground mt-1">{xp} / {nextLevelXp} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-destructive" />
                <span className="font-bold text-sm text-foreground">{streak}</span>
                <span className="text-xs text-muted-foreground -ml-1">d</span>
           </div>
            <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-sm text-foreground">{coins}</span>
            </div>
        </div>
      </div>
    </Card>
  );
}
