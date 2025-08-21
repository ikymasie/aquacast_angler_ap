
'use client';

import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AttemptsTimelineProps {
    timeline: {
        idx: number;
        result: 'miss' | 'outer' | 'inner' | 'center' | string; // Allow more general strings
        [key: string]: any;
    }[];
}

export function AttemptsTimeline({ timeline }: AttemptsTimelineProps) {

    const getSegmentColor = (result: string) => {
        switch (result) {
            case 'center':
            case 'bullseye':
                return 'bg-score-good';
            case 'inner':
            case 'good':
                 return 'bg-score-good/70';
            case 'outer':
            case 'okay':
                return 'bg-score-fair/70';
            case 'miss':
            default:
                return 'bg-muted';
        }
    };
    
    return (
         <Card className="p-3 rounded-xl">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Attempts Timeline</h4>
             <TooltipProvider>
                <div className="flex w-full h-6 gap-0.5">
                    {timeline.map(attempt => (
                         <Tooltip key={attempt.idx}>
                            <TooltipTrigger asChild>
                                <div className={`flex-1 rounded-sm ${getSegmentColor(attempt.result)}`}></div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Cast {attempt.idx}: <span className="capitalize">{attempt.result}</span></p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </Card>
    );
}

