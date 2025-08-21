
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Activity, Clock, Target } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const MOCK_DATA = {
  sessions: 5,
  minutes: 142,
  casts: 196,
  streak: 4,
  band: "Good",
  trend: [
    { day: "M", casts: 30 },
    { day: "T", casts: 45 },
    { day: "W", casts: 20 },
    { day: "T", casts: 55 },
    { day: "F", casts: 60 },
    { day: "S", casts: 15 },
    { day: "S", casts: 70 },
  ]
};

const bandColors: Record<string, string> = {
    "Good": "bg-score-good text-white",
    "Fair": "bg-score-fair text-foreground",
    "Poor": "bg-score-poor text-white",
};

function StatTile({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div>
                <p className="font-bold text-lg text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground -mt-1">{label}</p>
            </div>
        </div>
    )
}

export function WeeklyOverviewCard() {
    const { sessions, minutes, casts, streak, band, trend } = MOCK_DATA;
    const bandClass = bandColors[band] || 'bg-muted text-muted-foreground';

    return (
        <Card className="rounded-xl shadow-sm border-line-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline text-lg">This Week</h3>
                <Badge className={`${bandClass} border-0`}>{band}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <StatTile icon={Activity} value={sessions} label="Sessions" />
                <StatTile icon={Clock} value={minutes} label="Minutes" />
                <StatTile icon={Target} value={casts} label="Casts" />
                <StatTile icon={Flame} value={streak} label="Day Streak" />
            </div>

            <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis hide={true} />
                        <Bar dataKey="casts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
