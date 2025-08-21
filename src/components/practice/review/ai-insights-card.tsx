
'use client';

import { Card } from '@/components/ui/card';
import { Lightbulb, TrendingUp, CheckCircle, Bot } from 'lucide-react';

interface AiInsightsCardProps {
    insights: {
        confidence?: 'low' | 'medium' | 'high';
        outcome?: string[];
        improve?: string[];
        nextSteps?: string[];
    } | null;
}

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

export function AiInsightsCard({ insights }: AiInsightsCardProps) {

    if (!insights) {
        return (
            <Card className="p-4 rounded-xl bg-secondary/70 border-line-200 text-center">
                <p className="text-muted-foreground">AI insights are being generated for this session.</p>
            </Card>
        );
    }
    
    return (
        <Card className="p-4 rounded-xl bg-secondary/70 border-line-200 space-y-4">
            <div className="flex items-center gap-2">
                 <Bot className="w-5 h-5 text-primary" />
                 <h3 className="font-headline text-lg font-semibold text-foreground">AI Analysis</h3>
            </div>
           
            <InsightSection title="Outcome" icon={CheckCircle} items={insights.outcome || []} />
            <InsightSection title="How to Improve" icon={TrendingUp} items={insights.improve || []} />
            <InsightSection title="Next Steps" icon={Lightbulb} items={insights.nextSteps || []} />
        </Card>
    );
}

