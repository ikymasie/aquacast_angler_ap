
'use client';

import { AccuracyPack } from './accuracy-pack';
import { AttemptControls } from './attempt-controls';
import { CadencePack } from './cadence-pack';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pause, MoreVertical } from 'lucide-react';
import { savePracticeAttemptAction, completePracticeSessionAction } from '@/app/actions';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';

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

function PracticeTopBar({ drillName, onExit }: { drillName: string, onExit: () => void }) {
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
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Pause className="w-5 h-5 text-muted-foreground" />
                    </Button>
                     <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
           </div>
           <div className="text-center text-xs text-muted-foreground -mt-1">
                R1/3 • Cast 1/10 • 00:42
           </div>
        </div>
    )
}

function ScoreStrip() {
    const currentBand = "Good";
    const color = medicalPalette[currentBand as keyof typeof medicalPalette] || '#FFD666';


    return (
        <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-between text-sm shadow-sm border border-line-200">
            <div className="flex items-center gap-3">
                <span className="font-bold">x1.15</span>
                <span className="text-muted-foreground">Round: <span className="font-bold text-foreground">850</span></span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Acc: <span className="font-bold text-foreground">92%</span></span>
                 <Badge style={{ backgroundColor: `${color}2D`, color: color }} className="border-transparent">
                    {currentBand}
                </Badge>
            </div>
        </div>
    )
}


export function LivePracticeHUD({ drill, onExit }: LivePracticeHUDProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isSaving, startSaving] = useTransition();

    // This would be driven by drill type state
    const drillType = drill.techniques.includes('cast_sidearm') ? 'accuracy' : 'cadence'; 

    const handleLogAttempt = (attemptData: any) => {
        if (!user || !drill.sessionId) return;
        
        startSaving(async () => {
            const { success, error } = await savePracticeAttemptAction({
                userId: user.uid,
                sessionId: drill.sessionId,
                attemptData,
            });

            if (error) {
                toast({ variant: 'destructive', title: 'Save Failed', description: error });
            } else {
                toast({ variant: 'success', title: 'Attempt Logged!' });
            }
        });
    };

    const handleCompleteSession = () => {
        if (!user || !drill.sessionId) return;

        startSaving(async () => {
             const { success, error } = await completePracticeSessionAction({
                userId: user.uid,
                sessionId: drill.sessionId,
                finalScore: 8500, // Placeholder
                finalGrade: 'A' // Placeholder
            });
             if (error) {
                toast({ variant: 'destructive', title: 'Failed to Complete', description: error });
            } else {
                toast({ variant: 'default', title: 'Session Complete!' });
                onExit();
            }
        });
    }
    
    const handleLogGenericAttempt = () => {
         handleLogAttempt({
            roundNumber: 1,
            castNumber: 1,
            outcome: 'hit',
            ring: 'inner',
            points: 85,
            timestamp: new Date().toISOString()
        });
    }

    return (
        <div className="space-y-3">
            <PracticeTopBar drillName={drill.name} onExit={handleCompleteSession} />
            <ScoreStrip />
            
            <div className="bg-white rounded-xl p-4 min-h-[320px] shadow-sm border border-line-200">
                 {/* This is where the drill-specific panel will go */}
                 {drillType === 'accuracy' && <AccuracyPack />}
                 {drillType === 'cadence' && <CadencePack />}
            </div>
            
            {/* The real AttemptControls would open a sheet to gather data before calling handleLogAttempt */}
            <AttemptControls onLog={handleLogGenericAttempt} />
        </div>
    );
}
