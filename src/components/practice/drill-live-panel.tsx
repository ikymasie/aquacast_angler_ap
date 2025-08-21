
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PracticeSessionState, Attempt } from '@/hooks/use-practice-session';

const medicalPalette: Record<string, string> = {
    "Prime": "#0FB67F",
    "Very Good": "#26C6DA",
    "Good": "#7BD389",
    "Fair": "#FFD666",
    "Fair-Slow": "#FFB84D",
    "Poor": "#FF7A70",
    "Very Poor": "#E24848",
};

interface DrillLivePanelProps {
    drill: any;
    drillType: 'accuracy' | 'cadence';
    sessionState: PracticeSessionState;
    lastAttempt: Attempt | null;
    performanceBand: string;
    isPaused: boolean;
}

export function DrillLivePanel({ drill, drillType, sessionState, lastAttempt, performanceBand, isPaused }: DrillLivePanelProps) {
    const params = drill.params || {};
    const target = params.targets?.[0] || { distance_m: 15, radius_cm: 45 };
    const windHint = params.windHint_kph ? `Upwind ${params.windHint_kph[0]}-${params.windHint_kph[1]}kph` : 'Upwind';

    const castsPerRound = params.castsPerRound || 10;
    const progress = (sessionState.currentAttempt - 1) / castsPerRound;

    const currentRoundAttempts = sessionState.history.find(r => r.roundNumber === sessionState.currentRound)?.attempts || [];
    
    return (
        <div className="h-full flex flex-col justify-between">
            <HeaderRow distance={target.distance_m} radius={target.radius_cm} windHint={windHint} />
            <TargetCanvas lastAttempt={lastAttempt} key={sessionState.currentAttempt} />
            <GoalArc progress={progress} attempts={currentRoundAttempts} castsPerRound={castsPerRound} band={performanceBand} />
            <StatusRow lastAttempt={lastAttempt} sessionState={sessionState} />
        </div>
    );
}

function HeaderRow({ distance, radius, windHint }: { distance: number, radius: number, windHint: string }) {
    return (
        <div className="flex justify-between items-center">
            <div className="text-left">
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="font-headline text-xl font-bold text-foreground">{distance}m <span className="font-medium text-muted-foreground">({radius}cm)</span></p>
            </div>
            <Badge variant="outline" className="border-line-200">
                <Wind className="w-3 h-3 mr-1.5" />
                {windHint}
            </Badge>
        </div>
    );
}

function TargetCanvas({ lastAttempt }: { lastAttempt: Attempt | null }) {
    const ringColors = {
        bullseye: '#26C6DA',
        inner: '#7BD389',
        outer: '#FFD666',
        miss: '#FF7A70',
    };
    
    return (
        <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
            {/* Base Rings */}
            <div className="absolute inset-0 rounded-full bg-secondary/30"></div>
            <div className="absolute inset-[25%] rounded-full bg-secondary/40"></div>
            <div className="absolute inset-[37.5%] rounded-full bg-secondary/50"></div>
            <div className="absolute inset-[46.5%] rounded-full bg-secondary"></div>

            <AnimatePresence>
            {lastAttempt && (
                <motion.div
                    key="ripple"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0.5, 1, 0] }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute rounded-full"
                    style={{
                        inset: lastAttempt.ring === 'bullseye' ? '46.5%' : lastAttempt.ring === 'inner' ? '37.5%' : '25%',
                        backgroundColor: lastAttempt.ring ? ringColors[lastAttempt.ring] : 'transparent',
                        display: lastAttempt.outcome === 'hit' ? 'block' : 'none'
                    }}
                />
            )}
            </AnimatePresence>
            <AnimatePresence>
                {lastAttempt && lastAttempt.outcome === 'hit' && (
                    <motion.div
                        key="score-flash"
                        initial={{ y: 0, scale: 0.5, opacity: 0 }}
                        animate={{ y: -20, scale: 1, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute"
                    >
                        <Badge variant="default" className="text-sm" style={{ backgroundColor: lastAttempt.ring ? ringColors[lastAttempt.ring] : 'transparent' }}>
                           {lastAttempt.ring === 'bullseye' ? 'Bullseye' : lastAttempt.ring === 'inner' ? 'Inner' : 'Outer'} +{lastAttempt.points}
                        </Badge>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function GoalArc({ progress, attempts, castsPerRound, band }: { progress: number, attempts: Attempt[], castsPerRound: number, band: string }) {
    const size = 200;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius;
    const offset = circumference - (progress * circumference);

    const bandColor = medicalPalette[band] || '#BFD3D2';

    return (
        <div className="relative w-full flex justify-center items-center h-[120px]">
            <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`} className="overflow-visible">
                {/* Base Arc */}
                <path
                    d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Segments */}
                <g>
                    {Array.from({ length: castsPerRound }).map((_, i) => {
                        const attempt = attempts[i];
                        const startAngle = -180 + (i / castsPerRound) * 180;
                        const endAngle = -180 + ((i + 1) / castsPerRound) * 180;
                        const segmentPath = describeArc(size / 2, size / 2, radius, startAngle, endAngle);
                        return (
                            <path
                                key={i}
                                d={segmentPath}
                                fill="none"
                                stroke={attempt ? (attempt.outcome === 'hit' ? bandColor : '#FF7A704D') : 'transparent'}
                                strokeWidth={strokeWidth}
                                strokeLinecap="butt"
                            />
                        )
                    })}
                </g>
                 {/* Progress Dot */}
                 <motion.g
                    initial={{ rotate: -180 }}
                    animate={{ rotate: -180 + progress * 180 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    transform-origin="center"
                 >
                    <circle cx={size / 2 + radius} cy={size / 2} r="8" fill="#FFD348" stroke="white" strokeWidth="2" />
                 </motion.g>
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between px-4 text-xs text-muted-foreground">
                <span>Cast 1</span>
                <span>Cast {castsPerRound}</span>
            </div>
        </div>
    )
}

function StatusRow({ lastAttempt, sessionState }: { lastAttempt: Attempt | null, sessionState: PracticeSessionState }) {
    const currentRoundData = sessionState.history.find(r => r.roundNumber === sessionState.currentRound);
    const streak = currentRoundData?.attempts.reduce((acc, attempt) => attempt.outcome === 'hit' ? acc + 1 : 0, 0) || 0;
    
    return (
        <div className="text-center h-10">
        <AnimatePresence mode="wait">
            {lastAttempt && (
                <motion.div
                    key={sessionState.currentAttempt}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <p className="font-bold text-lg">
                        {lastAttempt.ring === 'bullseye' ? 'Bullseye!' : lastAttempt.ring === 'inner' ? 'Inner Ring' : lastAttempt.ring === 'outer' ? 'Outer Ring' : 'Miss'}
                        <span className="font-medium text-muted-foreground"> +{lastAttempt.points}pts</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Cast {sessionState.currentAttempt - 1}/{sessionState.history.find(r=>r.roundNumber === sessionState.currentRound)?.attempts.length || 0} • Streak {streak} • Round {sessionState.currentRound}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
        </div>
    );
}

// Helper to describe an SVG arc path
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number){
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;       
}
