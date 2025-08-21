
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

const MOCK_DRILLS = [
  { drillKey: "soft_skip_precision_v1", species: "bream", family: "soft", bestGrade: "A", lastScore: 78, hitsStrip: "1101100110" },
  { drillKey: "spinner_lane_cadence_v1", species: "bass", family: "spinner", bestGrade: "A", lastScore: 81, hitsStrip: "1011111011" },
  { drillKey: "bream_live_quiet_entry_v1", species: "bream", family: "live", bestGrade: "B", lastScore: 72, hitsStrip: "1110101101" },
  { drillKey: "bass_depth_ladder_hold_v1", species: "bass", family: "crank/swim", bestGrade: "A", lastScore: 85, hitsStrip: "1111011110" },
];

const gradeBands: Record<string, string> = {
    'S': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    'A': 'bg-score-good text-white',
    'B': 'bg-score-fair text-foreground',
    'C': 'bg-score-fair-slow text-white',
    'D': 'bg-score-poor text-white',
}

function DrillResultCard({ drill }: { drill: typeof MOCK_DRILLS[0] }) {
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

export function DrillOverviewCarousel() {
  return (
    <div className="space-y-3">
        <SectionHeader title="Recent Drills" />
        <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2">
                {MOCK_DRILLS.map((drill) => (
                    <CarouselItem key={drill.drillKey} className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3">
                       <DrillResultCard drill={drill} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    </div>
  );
}
