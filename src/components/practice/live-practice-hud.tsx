
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DrillLivePanel } from './drill-live-panel';
import { AttemptControls } from './attempt-controls';
import { InstructionCard } from './instruction-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pause, MoreVertical, Play, X } from 'lucide-react';
import { savePracticeAttemptAction, completePracticeSessionAction } from '@/app/actions';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { usePracticeSession, type Ring } from '@/hooks/use-practice-session';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface LivePracticeHUDProps {
    drill: any;
    onExit: () => void;
}

const RING_LABELS: Record<Ring, string> = {
    bullseye: 'Bullseye!',
    good: 'Good Cast',
    okay: 'Okay',
    miss: 'Miss',
};


const medicalPalette: Record<string, string> = {
    "Prime": "#0FB67F",
    "Very Good": "#26C6DA",
    "Good": "#7BD389",
    "Fair": "#FFD666",
    "Fair-Slow": "#FFB84D",
    "Poor": "#FF7A70",
    "Very Poor": "#E24848",
};

function PracticeTopBar({ drillName, onExit, onPauseToggle, isPaused, round, cast, time }: { drillName: string, onExit: () => void, onPauseToggle: () => void, isPaused: boolean, round: number, cast: number, time: number }) {
    const totalRounds = 3; // These should come from drill params
    const totalCasts = 10;
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    return (
        <div className="h-14 p-2 bg-white/10 backdrop-blur-md rounded-t-xl border-b border-white/20 flex flex-col justify-center text-white">
           <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white hover:text-white hover:bg-white/10" onClick={onExit}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-sm font-medium">{drillName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white hover:text-white hover:bg-white/10" onClick={onPauseToggle}>
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                     <Button variant="ghost" size="icon" className="w-8 h-8 text-white hover:text-white hover:bg-white/10">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
           </div>
           <div className="text-center text-xs text-white/70 -mt-1">
                R{round}/{totalRounds} • Cast {cast}/{totalCasts} • {formatTime(time)}
           </div>
        </div>
    )
}

function ScoreStrip({ roundScore, accuracy, performanceBand }: { roundScore: number; accuracy: number; performanceBand: string; }) {
    const color = medicalPalette[performanceBand] || '#FFD666';

    return (
        <div className="h-10 px-3 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-between text-sm shadow-sm border border-line-200">
            <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">x1.15</span>
                <span className="text-muted-foreground">Round: <span className="font-bold text-foreground">{roundScore}</span></span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Acc: <span className="font-bold text-foreground">{accuracy}%</span></span>
                 <Badge style={{ backgroundColor: `${color}2D`, color: color }} className="border-transparent">
                    {performanceBand}
                </Badge>
            </div>
        </div>
    )
}

function PauseOverlay({ onResume }: { onResume: () => void }) {
    return (
        <div className="absolute inset-0 z-10 bg-panel/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-b-xl">
            <h2 className="text-2xl font-bold font-headline text-white">Paused</h2>
            <Button onClick={onResume} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Resume
            </Button>
        </div>
    )
}


export function LivePracticeHUD({ drill, onExit }: LivePracticeHUDProps) {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, startSaving] = useTransition();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    
    const {
        sessionState,
        logAttempt,
        undoLastAttempt,
        togglePause,
        getDisplayMetrics,
        canUndo,
    } = usePracticeSession({ initialDrill: drill });
    
    const accuracyDrillKeywords = ['pitch_flip', 'skip_sidearm', 'cast_sidearm', 'cast_overhead', 'float_entry'];
    const drillType = drill.techniques.some((tech: string) => accuracyDrillKeywords.includes(tech)) ? 'accuracy' : 'cadence';


    const handleLogGenericAttempt = (outcome: 'hit' | 'miss', ring: Ring) => {
        if (!user || !drill.sessionId || isSaving || sessionState.status !== 'in-progress') return;
        
        let points = 0;
        if (outcome === 'hit') {
            if (ring === 'bullseye') points = 100;
            else if (ring === 'good') points = 85;
            else if (ring === 'okay') points = 70;
        }

        startSaving(async () => {
            const attemptData = {
                outcome,
                ring,
                points,
            };

            const success = logAttempt(attemptData);
            if (success) {
                 const { success: saved, error } = await savePracticeAttemptAction({
                    userId: user.uid,
                    sessionId: drill.sessionId,
                    attemptData: {
                        roundNumber: sessionState.currentRound,
                        castNumber: sessionState.currentAttempt,
                        ...attemptData,
                        timestamp: new Date().toISOString()
                    },
                });

                if (error) {
                    toast({ variant: 'destructive', title: 'Save Failed', description: error });
                    undoLastAttempt(); // Rollback local state
                }
            } else {
                 handleCompleteRound();
            }
        });
    };
    
    const handleCompleteRound = async () => {
        if (!user || !drill.sessionId) return;
        
        const finalMetrics = getDisplayMetrics();
        const { success, error } = await completePracticeSessionAction({
            userId: user.uid,
            sessionId: drill.sessionId,
            finalScore: finalMetrics.totalScore,
            finalGrade: 'A' // Placeholder
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Failed to Complete', description: error });
        } else {
            toast({ variant: 'default', title: 'Session Complete!', description: 'Redirecting to review...' });
            router.push(`/practice/review/${drill.sessionId}`);
        }
    };


    const handleExitSession = () => {
        setIsExitDialogOpen(false);
        handleCompleteRound();
    };


    const {
        roundScore,
        accuracy,
        performanceBand,
        totalScore,
        currentRound,
        currentAttempt,
        elapsedTime,
        status,
        lastAttempt
    } = getDisplayMetrics();

    return (
        <>
            <div className="space-y-3">
                <div className="relative gradient-fishing-panel rounded-xl p-4 min-h-[420px] shadow-sm border border-white/20">
                     <PracticeTopBar 
                        drillName={drill.name} 
                        onExit={() => setIsExitDialogOpen(true)} 
                        onPauseToggle={togglePause}
                        isPaused={status === 'paused'}
                        round={currentRound}
                        cast={currentAttempt}
                        time={elapsedTime}
                    />
                    
                     {status === 'paused' ? <PauseOverlay onResume={togglePause} /> : (
                         <DrillLivePanel 
                             drill={drill}
                             drillType={drillType}
                             sessionState={sessionState}
                             lastAttempt={lastAttempt}
                             performanceBand={performanceBand}
                             isPaused={status === 'paused'}
                             ringLabels={RING_LABELS}
                         />
                     )}
                </div>

                <ScoreStrip 
                    roundScore={roundScore}
                    accuracy={accuracy}
                    performanceBand={performanceBand}
                />
                
                {drill.coachingTemplates && (
                    <InstructionCard templates={drill.coachingTemplates} />
                )}
                
                <AttemptControls 
                    round={currentRound}
                    attempt={currentAttempt}
                    onLog={() => handleLogGenericAttempt('hit', 'good')} 
                    onMiss={() => handleLogGenericAttempt('miss', 'miss')}
                    onBite={() => handleLogGenericAttempt('hit', 'bullseye')}
                    onUndo={undoLastAttempt}
                    canUndo={canUndo}
                />
            </div>
             <AlertDialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>End Practice Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to complete this drill? Your progress will be saved, and you'll be taken to the review screen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExitSession} className="bg-destructive hover:bg-destructive/90">
                            <X className="w-4 h-4 mr-2" />
                            End & Review
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

