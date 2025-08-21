
'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SectionHeader } from "../section-header";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const gradeBands: Record<string, string> = {
    'S': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    'A': 'bg-score-good text-white',
    'B': 'bg-score-fair text-foreground',
    'C': 'bg-score-fair-slow text-white',
    'D': 'bg-score-poor text-white',
    'N/A': 'bg-muted text-muted-foreground'
}

interface DrillResultCardProps {
    drill: {
        drillKey: string;
        species: string;
        family: string;
        bestGrade: string;
        lastScore: number;
        hitsStrip: string;
    };
}

function DrillResultCard({ drill }: DrillResultCardProps) {
    const gradeClass = gradeBands[drill.bestGrade] || 'bg-muted text-muted-foreground';
    
    return (
        <Card className="p-3 rounded-xl flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm leading-tight pr-2">{drill.drillKey.replace(/_/g, ' ').replace('v1', '').trim()}</p>
                    <Badge className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg ${gradeClass}`}>
                        {drill.bestGrade}
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="capitalize">{drill.species}</Badge>
                    <Badge variant="outline" className="capitalize">{drill.family}</Badge>
                </div>
            </div>
            <div className="mt-3 space-y-2">
                 <div className="flex w-full h-4 gap-0.5">
                    {drill.hitsStrip.split('').map((hit, i) => (
                        <div key={i} className={`flex-1 rounded-sm ${hit === '1' ? 'bg-primary/50' : 'bg-muted'}`} />
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1 h-8">Replay</Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8">History</Button>
                </div>
            </div>
        </Card>
    )
}

interface DrillOverviewCarouselProps {
    drills: DrillResultCardProps['drill'][];
}

export function DrillOverviewCarousel({ drills }: DrillOverviewCarouselProps) {
  return (
    <div className="space-y-3">
        <SectionHeader title="Recent Drills" />
         {drills.length === 0 ? (
            <Card className="p-4 rounded-xl text-center border-dashed">
                <p className="text-muted-foreground">Complete a practice session to see it here.</p>
            </Card>
        ) : (
            <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent className="-ml-2">
                    {drills.map((drill) => (
                        <CarouselItem key={drill.drillKey} className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3">
                        <DrillResultCard drill={drill} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        )}
    </div>
  );
}
