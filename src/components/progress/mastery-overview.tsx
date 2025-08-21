
'use client';

import { Card } from '@/components/ui/card';
import { SectionHeader } from '../section-header';
import { Progress } from '@/components/ui/progress';
import { Badge } from '../ui/badge';
import Image from 'next/image';

interface MasteryItem {
    key: string;
    name: string;
    pct: number;
    topSkill?: string;
    image: string;
}

interface MasteryOverviewProps {
    speciesMastery: MasteryItem[];
    familyMastery: MasteryItem[];
}

function MasteryBar({ name, pct, topSkill, image }: MasteryItem) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <Image src={image} alt={name} width={32} height={32} className="object-contain" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm">{name}</p>
                    <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
                 {topSkill && (
                    <div className="mt-1.5">
                        <Badge variant="outline" className="text-xs">Top Skill: {topSkill}</Badge>
                    </div>
                )}
            </div>
        </div>
    )
}

export function MasteryOverview({ speciesMastery, familyMastery }: MasteryOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl p-4 space-y-4">
            <SectionHeader title="Species Mastery" />
            {speciesMastery.length > 0 ? speciesMastery.map(species => (
                <MasteryBar key={species.key} {...species} />
            )) : <p className="text-sm text-muted-foreground">Practice to see your species mastery.</p>}
        </Card>
        <Card className="rounded-xl p-4 space-y-4">
            <SectionHeader title="Bait Family Mastery" />
            {familyMastery.length > 0 ? familyMastery.map(family => (
                 <MasteryBar key={family.key} {...family} />
            )) : <p className="text-sm text-muted-foreground">Practice to see your lure mastery.</p>}
        </Card>
    </div>
  );
}
