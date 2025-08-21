
'use client';

import { Card } from '@/components/ui/card';
import { Target, Clock, AlertTriangle, Repeat, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface KpiTileProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    unit?: string;
}

function KpiTile({ icon: Icon, label, value, unit }: KpiTileProps) {
    return (
        <Card className="p-3 rounded-lg bg-secondary/60 border-line-200">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
            <p className="font-bold text-2xl font-headline text-foreground">
                {value}<span className="text-lg ml-0.5">{unit}</span>
            </p>
        </Card>
    );
}

interface KpiGridProps {
    kpis: any;
    drillType: 'accuracy' | 'cadence' | 'stopgo' | 'rig';
}

export function KpiGrid({ kpis, drillType }: KpiGridProps) {
    const kpiList: ReactNode[] = [];

    if (drillType === 'accuracy' || drillType === 'rig') {
        kpiList.push(<KpiTile key="accuracy" icon={Target} label="Accuracy" value={kpis.accuracyPct || 0} unit="%" />);
        kpiList.push(<KpiTile key="streak" icon={TrendingUp} label="Max Streak" value={kpis.maxStreak || 0} unit=" hits" />);
        kpiList.push(<KpiTile key="center" icon={CheckCircle} label="Bullseyes" value={kpis.centerHits || 0} />);
        kpiList.push(<KpiTile key="misses" icon={XCircle} label="Misses" value={kpis.misses || 0} />);
    }

    if (drillType === 'cadence' || drillType === 'stopgo') {
        kpiList.push(<KpiTile key="inband" icon={Target} label="In-Band" value={kpis.inBandPct || 0} unit="%" />);
        kpiList.push(<KpiTile key="avg_error" icon={AlertTriangle} label="Avg. Cadence Error" value={kpis.avgCadenceErrorSpm || 0} unit=" spm" />);
        kpiList.push(<KpiTile key="depth" icon={Clock} label="Depth In-Band" value={kpis.depthInBandPct || 0} unit="%" />);
        kpiList.push(<KpiTile key="bins" icon={Repeat} label="Bins Hit" value={kpis.binsHit || 0} />);
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpiList.slice(0, 4)}
        </div>
    );
}
