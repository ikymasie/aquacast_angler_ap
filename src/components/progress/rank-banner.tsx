
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Dot, HelpCircle } from 'lucide-react';
import { RequirementsSheet } from './requirements-sheet';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '../ui/skeleton';


const MOCK_DATA = {
  rank: {
    current: "Master Baiter",
    next: "Master Caster",
    rankPoints: 1240,
    nextRankPoints: 2000,
    progressPct: 62
  },
  requirements: [
    { key: "weekly_accuracy", label: "Accuracy ≥ 75%", valuePct: 72, targetPct: 75, status: "in_progress" as const },
    { key: "cadence_in_band", label: "Cadence in-band ≥ 65%", valuePct: 68, targetPct: 65, status: "met" as const },
    { key: "lane_time", label: "Lane time ≥ 55%", valuePct: 49, targetPct: 55, status: "needs_attention" as const },
    { key: "species_diversity", label: "3 species practiced (14d)", value: 2, target: 3, status: "in_progress" as const },
    { key: "bait_diversity", label: "2 bait families (7d)", value: 1, target: 2, status: "in_progress" as const },
  ],
};


export function RankBanner() {
    const { user, isLoading } = useUser();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    if (isLoading || !user) {
        return <Skeleton className="h-[280px] w-full rounded-xl" />;
    }

    const { rank, requirements } = MOCK_DATA;
    const { practiceProfile } = user;
    const rankPoints = practiceProfile?.xp || 0;
    const nextRankPoints = practiceProfile?.nextLevelXp || 2000;
    const progressPct = (rankPoints / nextRankPoints) * 100;
    
    return (
        <>
            <Card className="rounded-xl shadow-card border-0 p-4 bg-gradient-to-br from-primary to-primary-dark text-white overflow-hidden">
                <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-white/10 border-0 text-white font-semibold">Master Baiter</Badge>
                    <span className="text-xs text-white/70">Next: Master Caster</span>
                </div>

                <RankGauge progress={progressPct} />

                <div className="text-center -mt-8">
                    <p className="font-headline text-3xl font-bold">{rankPoints}<span className="text-2xl text-white/70"> / {nextRankPoints}</span></p>
                    <p className="text-sm text-white/80">Rank Points</p>
                </div>
                
                <div className="mt-4">
                     <p className="text-xs text-center text-white/70 mb-2">Next Rank Requirements</p>
                     <div className="flex flex-wrap items-center justify-center gap-2">
                        {requirements.slice(0, 3).map(req => {
                            const isMet = req.status === 'met';
                            return (
                                <Badge key={req.key} variant="secondary" className="bg-white/15 border-0 text-white/90 h-6">
                                    {isMet ? <Check className="w-3 h-3 mr-1.5 text-green-300" /> : <Dot className="w-4 h-4 mr-0.5 -ml-1 text-amber-300" />}
                                    {req.label}
                                </Badge>
                            );
                        })}
                     </div>
                </div>
                 <div className="text-center mt-4">
                    <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" onClick={() => setIsSheetOpen(true)}>
                        View All Requirements
                    </Button>
                </div>

            </Card>
            <RequirementsSheet
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                requirements={requirements}
            />
        </>
    );
}

function RankGauge({ progress }: { progress: number }) {
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;

  const dotAngle = -180 + (progress / 100) * 180;
  
  return (
    <div className="relative w-full flex justify-center items-center h-[140px]">
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`} className="overflow-visible">
        <defs>
          <linearGradient id="arc-gradient-rank" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F2C94C" />
            <stop offset="100%" stopColor="#27BFA6" />
          </linearGradient>
        </defs>
        <motion.path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke="url(#arc-gradient-rank)"
          strokeOpacity={0.2}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke="url(#arc-gradient-rank)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
         <motion.g
          initial={{ rotate: -180 }}
          animate={{ rotate: dotAngle }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{ transformOrigin: "center center" }}
        >
          <circle cx={size / 2 + radius} cy={size / 2} r="8" fill="white" stroke="#27BFA6" strokeWidth="2" />
        </motion.g>
      </svg>
    </div>
  );
}

