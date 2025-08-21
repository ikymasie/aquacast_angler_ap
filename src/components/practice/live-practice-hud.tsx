
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AccuracyPack } from './accuracy-pack';
import { AttemptControls } from './attempt-controls';
import { CadencePack } from './cadence-pack';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pause, MoreVertical, Play, X } from 'lucide-react';
import { savePracticeAttemptAction, completePracticeSessionAction } from '@/app/actions';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { usePracticeSession } from '@/hooks/use-practice-session';
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

const medicalPalette = {
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
        <div className="h-14 p-2 bg-white/80 backdrop-blur-md rounded-t-xl border-b border-line-200 shadow-sm flex flex-col justify-center">
           <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onExit}>
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <span className="text-sm font-medium">{drillName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onPauseToggle}>
                        {isPaused ? <Play className="w-5 h-5 text-muted-foreground" /> : <Pause className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                     <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
           </div>
           <div className="text-center text-xs text-muted-foreground -mt-1">
                R{round}/{totalRounds} • Cast {cast}/{totalCasts} • {formatTime(time)}
           </div>
        </div>
    )
}

function ScoreStrip({ roundScore, accuracy, performanceBand }: { roundScore: number; accuracy: number; performanceBand: string; }) {
    const color = medicalPalette[performanceBand as keyof typeof medicalPalette] || '#FFD666';

    return (
        <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-between text-sm shadow-sm border border-line-200">
            <div className="flex items-center gap-3">
                <span className="font-bold">x1.15</span>
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
        <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-b-xl">
            <h2 className="text-2xl font-bold font-headline">Paused</h2>
            <Button onClick={onResume} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Resume
            </Button>
        </div>
    )
}


export function LivePracticeHUD({ drill, onExit }: LivePracticeHUDProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isSaving, startSaving] = useTransition();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    
    const {
        sessionState,
        logAttempt,
        undoLastAttempt,
        togglePause,
        getDisplayMetrics
    } = usePracticeSession({ initialDrill: drill });
    
    const accuracyDrillKeywords = ['pitch_flip', 'skip_sidearm', 'cast_sidearm', 'cast_overhead'];
    const drillType = drill.techniques.some((tech: string) => accuracyDrillKeywords.includes(tech)) ? 'accuracy' : 'cadence';


    const handleLogGenericAttempt = (outcome: 'hit' | 'miss') => {
        if (!user || !drill.sessionId || isSaving || sessionState.status !== 'in-progress') return;
        
        startSaving(async () => {
            const attemptData = {
                outcome,
                ring: outcome === 'hit' ? 'inner' : 'miss', // This is simplified. A real impl would have a way to select the ring.
                points: outcome === 'hit' ? 85 : 0, // Simplified point system
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
                } else {
                     toast({ 
                        variant: 'success', 
                        title: `Cast ${outcome === 'hit' ? 'Logged' : 'Missed'}!`,
                        description: `Points: ${attemptData.points}`
                    });
                }
            } else {
                 toast({ 
                    variant: 'destructive', 
                    title: 'Round Complete', 
                    description: 'Please start the next round.'
                });
            }
        });
    };

    const handleCompleteSession = () => {
        if (!user || !drill.sessionId) return;
        setIsExitDialogOpen(false);

        startSaving(async () => {
            const finalMetrics = getDisplayMetrics();
            const { success, error } = await completePracticeSessionAction({
                userId: user.uid,
                sessionId: drill.sessionId,
                finalScore: finalMetrics.totalScore,
                finalGrade: 'A' // Placeholder for final grade calculation
            });
            if (error) {
                toast({ variant: 'destructive', title: 'Failed to Complete', description: error });
            } else {
                toast({ variant: 'default', title: 'Session Complete!', description: 'Your progress has been saved.' });
                onExit();
            }
        });
    }

    const {
        roundScore,
        accuracy,
        performanceBand,
        totalScore,
        currentRound,
        currentAttempt,
        elapsedTime,
        status,
    } = getDisplayMetrics();

    return (
        <>
            <div className="space-y-3">
                <PracticeTopBar 
                    drillName={drill.name} 
                    onExit={() => setIsExitDialogOpen(true)} 
                    onPauseToggle={togglePause}
                    isPaused={status === 'paused'}
                    round={currentRound}
                    cast={currentAttempt}
                    time={elapsedTime}
                />
                <ScoreStrip 
                    roundScore={roundScore}
                    accuracy={accuracy}
                    performanceBand={performanceBand}
                />
                
                <div className="relative bg-white rounded-xl p-4 min-h-[320px] shadow-sm border border-line-200">
                    {status === 'paused' && <PauseOverlay onResume={togglePause} />}
                     {drillType === 'accuracy' && <AccuracyPack drill={drill} />}
                     {drillType === 'cadence' && <CadencePack drill={drill} />}
                </div>
                
                <AttemptControls 
                    round={currentRound}
                    attempt={currentAttempt}
                    onLog={() => handleLogGenericAttempt('hit')} 
                    onMiss={() => handleLogGenericAttempt('miss')}
                    onUndo={undoLastAttempt}
                    canUndo={sessionState.history.length > 0 && sessionState.history[sessionState.history.length - 1].attempts.length > 0}
                />
            </div>
             <AlertDialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>End Practice Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to complete this drill? Your progress will be saved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCompleteSession} className="bg-destructive hover:bg-destructive/90">
                            <X className="w-4 h-4 mr-2" />
                            End Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
