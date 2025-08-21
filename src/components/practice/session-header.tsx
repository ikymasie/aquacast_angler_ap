
'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Star, Shield, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface PracticeProfile {
    level: number;
    xp: number;
    streak: number;
    coins: number;
    nextLevelXp: number;
    isFallback?: boolean;
}

interface SessionHeaderProps {
  profile: PracticeProfile;
}

export function SessionHeader({ profile }: SessionHeaderProps) {
  const { level, xp, nextLevelXp, streak, coins, isFallback = false } = profile;
  const progress = (xp / nextLevelXp) * 100;

  return (
    <Card className="rounded-xl p-4 shadow-sm border-line-200">
      <TooltipProvider>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger>
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-lg text-primary">{level}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-background p-0.5 rounded-full">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your current practice level.</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex-1">
              <p className="font-semibold text-sm flex items-center gap-1">
                Level {level}
                {isFallback && (
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is your starting profile. Complete drills to save your progress!</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </p>
              <Progress value={progress} className="h-2 mt-1" />
              <p className="text-xs text-muted-foreground mt-1">{xp} / {nextLevelXp} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <Flame className="w-5 h-5 text-destructive" />
                  <span className="font-bold text-sm text-foreground">{streak}</span>
                  <span className="text-xs text-muted-foreground -ml-1">d</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Daily practice streak</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-sm text-foreground">{coins}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Practice coins earned</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </Card>
  );
}
