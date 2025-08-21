
'use client';

import { Card } from '@/components/ui/card';
import { SectionHeader } from '../section-header';
import { Progress } from '@/components/ui/progress';
import { Badge } from '../ui/badge';
import Image from 'next/image';

const MOCK_SPECIES = [
  { key: "bream", name: "Bream", pct: 61, lastSessionISO: "2025-08-19", topSkill: "Quiet Entry", image: "/images/fish/bream.png" },
  { key: "bass",  name: "Bass", pct: 54, lastSessionISO: "2025-08-20", topSkill: "Lane/Edge", image: "/images/fish/bass.webp" },
  { key: "carp",  name: "Carp", pct: 48, lastSessionISO: "2025-08-17", topSkill: "Distance Acc", image: "/images/fish/carp.png" },
];

const MOCK_FAMILIES = [
  { key: "soft", name: "Soft", pct: 63, image: "/images/baits/soft.png" },
  { key: "spinner", name: "Spinner", pct: 51, image: "/images/baits/spinner.webp" },
  { key: "crank_swim", name: "Crank/Swim", pct: 46, image: "/images/baits/crank.webp" },
  { key: "live", name: "Live", pct: 58, image: "/images/baits/live.png" },
];

function MasteryBar({ name, pct, topSkill, image }: { name: string, pct: number, topSkill?: string, image: string }) {
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

export function MasteryOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl p-4 space-y-4">
            <SectionHeader title="Species Mastery" />
            {MOCK_SPECIES.map(species => (
                <MasteryBar key={species.key} name={species.name} pct={species.pct} topSkill={species.topSkill} image={species.image} />
            ))}
        </Card>
        <Card className="rounded-xl p-4 space-y-4">
            <SectionHeader title="Bait Family Mastery" />
            {MOCK_FAMILIES.map(family => (
                 <MasteryBar key={family.key} name={family.name} pct={family.pct} image={family.image} />
            ))}
        </Card>
    </div>
  );
}
