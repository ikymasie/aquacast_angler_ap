
'use client';

import React, { useState } from 'react';
import type { ScoreStatus } from "@/lib/types";
import type { CastingAdviceOutput } from '@/ai/flows/casting-advice-flow';
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from '@/lib/utils';
import { SpotBankIcon } from './icons/spot-bank';
import { SpotCoverIcon } from './icons/spot-cover';
import { SpotDropOffIcon } from './icons/spot-drop-off';
import { SpotFlatIcon } from './icons/spot-flat';
import { SpotInflowIcon } from './icons/spot-inflow';
import { SpotPointIcon } from './icons/spot-point';
import { Fish, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Badge } from './ui/badge';

export const getIconForSpot = (spotName: string): React.FC<any> => {
    const keywords: Record<string, React.FC<any>> = {
        "drop-off": SpotDropOffIcon,
        "flat": SpotFlatIcon,
        "weed": SpotFlatIcon,
        "bank": SpotBankIcon,
        "point": SpotPointIcon,
        "cover": SpotCoverIcon,
        "shade": SpotCoverIcon,
        "inflow": SpotInflowIcon,
        "creek": SpotInflowIcon,
        "seam": SpotInflowIcon,
        "structure": SpotCoverIcon,
        "transition": SpotBankIcon,
        "vegetation": SpotCoverIcon,
        "rocky": SpotPointIcon,
        "dam": SpotDropOffIcon,
    };

    const lowerCaseName = spotName.toLowerCase();
    for (const keyword in keywords) {
        if (lowerCaseName.includes(keyword)) {
            return keywords[keyword];
        }
    }
    return SpotBankIcon; // Default icon
};

type SpotAdvice = CastingAdviceOutput['where_to_cast']['ranked_spots'][0];

interface CastingAdvisorPanelProps {
    isLoading: boolean;
    advice: CastingAdviceOutput | null;
}

export function CastingAdvisorPanel({ isLoading, advice }: CastingAdvisorPanelProps) {
    const [selectedSpot, setSelectedSpot] = useState<SpotAdvice | null>(null);

    const handleSpotClick = (spot: SpotAdvice) => {
        setSelectedSpot(spot);
    };

    const handleDialogClose = () => {
        setSelectedSpot(null);
    };


    if (isLoading) {
        return <CastingAdvisorSkeleton />;
    }

    if (!advice) {
        return (
            <Card className="w-full rounded-xl border-dashed border-2 h-[280px] p-4 flex items-center justify-center bg-secondary">
                <p className="text-center font-medium text-muted-foreground">Select a lure to get casting advice.</p>
            </Card>
        );
    }

    const { where_to_cast, how_to_fish } = advice;

    const topSpots = where_to_cast.ranked_spots.slice(0, 6);

    return (
        <>
        <Card className="w-full rounded-xl shadow-card border-0 p-4 space-y-4 gradient-fishing-panel text-white">
            <div>
                <h3 className="font-headline text-lg">Where to Cast</h3>
                <p className="text-white/80 text-sm mt-1">{where_to_cast.summary}</p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                    {topSpots.map(spot => {
                        const Icon = getIconForSpot(spot.name);
                        return (
                             <button 
                                key={spot.name} 
                                onClick={() => handleSpotClick(spot)}
                                className="bg-white/15 rounded-lg p-2 text-center flex flex-col items-center justify-center h-[90px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                             >
                                <Icon className="w-6 h-6 text-white/90" />
                                <span className="font-headline font-bold text-xl mt-1">{spot.score}</span>
                                <span className="text-[10px] leading-tight font-medium text-white/80 mt-0.5">{spot.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-white/20 pt-4">
                <h3 className="font-headline text-lg">How to Fish</h3>
                <p className="text-white/80 text-sm mt-1 mb-3">{how_to_fish.summary}</p>
                <div className="space-y-2">
                    {how_to_fish.techniques.map(tech => (
                        <div key={tech.name} className="flex gap-3 items-start">
                            <div className="w-5 h-5 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                               <Fish className="w-3 h-3 text-white/80" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm leading-tight">{tech.name}</h4>
                                <p className="text-xs text-white/70 leading-snug">{tech.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
        {selectedSpot && (
            <SpotDetailDialog 
                spot={selectedSpot}
                isOpen={!!selectedSpot}
                onClose={handleDialogClose}
            />
        )}
        </>
    );
}

interface SpotDetailDialogProps {
    spot: SpotAdvice;
    isOpen: boolean;
    onClose: () => void;
}

function SpotDetailDialog({ spot, isOpen, onClose }: SpotDetailDialogProps) {
    const Icon = getIconForSpot(spot.name);
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <AlertDialogTitle className="font-headline text-2xl">{spot.name}</AlertDialogTitle>
                            <Badge variant={spot.score > 70 ? 'default' : 'secondary'} className="mt-1">{spot.score} / 100 - {spot.status}</Badge>
                        </div>
                    </div>
                    <AlertDialogDescription className="text-base text-muted-foreground pt-2">
                        {spot.reasoning}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-2 space-y-3">
                   <DialogSection icon={CheckCircle2} title="Deciding Factors">
                        {spot.deciding_factors.map(factor => <li key={factor}>{factor}</li>)}
                   </DialogSection>
                    <DialogSection icon={ShieldAlert} title="Things to Watch For">
                        {spot.watch_outs.map(watch_out => <li key={watch_out}>{watch_out}</li>)}
                    </DialogSection>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

function DialogSection({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode}) {
    return (
        <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <Icon className="w-4 h-4 text-muted-foreground"/>
                {title}
            </h4>
            <ul className="list-disc pl-8 mt-1 text-sm text-muted-foreground space-y-1">
                {children}
            </ul>
        </div>
    )
}


function CastingAdvisorSkeleton() {
    return (
         <Card className="w-full rounded-xl p-4 space-y-4">
             <div className="space-y-2">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-3/4" />
                 <div className="grid grid-cols-3 gap-2 pt-2">
                    <Skeleton className="w-full h-[90px] rounded-lg" />
                    <Skeleton className="w-full h-[90px] rounded-lg" />
                    <Skeleton className="w-full h-[90px] rounded-lg" />
                    <Skeleton className="w-full h-[90px] rounded-lg" />
                    <Skeleton className="w-full h-[90px] rounded-lg" />
                    <Skeleton className="w-full h-[90px] rounded-lg" />
                 </div>
             </div>
              <div className="space-y-2 pt-4 border-t">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-full" />
                 <div className="space-y-3 mt-2">
                    <div className="flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                     <div className="flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                 </div>
             </div>
        </Card>
    );
}
