
'use client';

import { Card } from '@/components/ui/card';
import { Lightbulb, TrendingUp, CheckCircle } from 'lucide-react';
import { AquaCastLogo } from '@/components/aqua-cast-logo';
import { SectionHeader } from '../section-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '../ui/badge';


const MOCK_INSIGHTS = {
    "insightsVersion": "1.0",
    "confidence": "high",
    "outcome": [
      "Accuracy trended up mid-week to 75% as quiet-entry improved to 71%, indicating better line feathering in calm conditions."
    ],
    "improve": [
      "Lane time is 54% vs 55% target; aim 0.6–1.0 m upwind to hold the edge longer in 8–16 kph breeze."
    ],
    "nextSteps": [
      "Run Spinner Lane Cadence at 60±6 spm and repeat Soft Skip with 3 m tighter targets to unlock the challenge requirement."
    ]
};


function InsightSection({ title, icon: Icon, items }: { title: string, icon: React.ElementType, items: string[] }) {
    if (!items || items.length === 0) return null;

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold text-muted-foreground text-sm">{title}</h4>
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/90 pl-3">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function AiCoachCard() {
    const insights = MOCK_INSIGHTS;
    
    if (!insights) {
        return (
            <Card className="p-4 rounded-xl bg-secondary/70 border-line-200 text-center">
                <p className="text-muted-foreground">AI insights are being generated for your progress.</p>
            </Card>
        );
    }
    
    return (
        <Card className="rounded-xl p-4 space-y-4">
             <div className="flex justify-between items-center">
                <SectionHeader title="AquaCast Coach" />
                <Badge variant="outline" className="capitalize border-primary/50 text-primary">
                    Confidence: {insights.confidence}
                </Badge>
            </div>
            <Tabs defaultValue="outcome" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="outcome">Outcome</TabsTrigger>
                    <TabsTrigger value="improve">Improve</TabsTrigger>
                    <TabsTrigger value="next_steps">Next Steps</TabsTrigger>
                </TabsList>
                <TabsContent value="outcome" className="pt-4">
                    <InsightSection title="Your Progress Highlights" icon={CheckCircle} items={insights.outcome || []} />
                </TabsContent>
                <TabsContent value="improve" className="pt-4">
                     <InsightSection title="Opportunities for Improvement" icon={TrendingUp} items={insights.improve || []} />
                </TabsContent>
                <TabsContent value="next_steps" className="pt-4">
                     <InsightSection title="Your Suggested Next Steps" icon={Lightbulb} items={insights.nextSteps || []} />
                </TabsContent>
            </Tabs>
        </Card>
    );
}
