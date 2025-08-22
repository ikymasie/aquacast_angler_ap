
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { SectionHeader } from '../section-header';
import { Skeleton } from '../ui/skeleton';
import { useTransition } from 'react';
import { getSuggestedDrillAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface Quest {
    label: string;
    isComplete: boolean;
    [key: string]: any; // Allow other properties
}

interface QuestsCardProps {
    quests: Quest[];
    isLoading: boolean;
    availableDrills: any[];
    onStartDrill: (drill: any) => void;
}


export function QuestsCard({ quests, isLoading, availableDrills, onStartDrill }: QuestsCardProps) {
    const [isSuggesting, startSuggestion] = useTransition();
    const { toast } = useToast();

    const handleSuggestDrill = () => {
        startSuggestion(async () => {
            const { data, error } = await getSuggestedDrillAction({
                quests,
                availableDrills
            });

            if (error || !data) {
                toast({ variant: 'destructive', title: 'Suggestion Failed', description: error || 'Could not get an AI suggestion.' });
                return;
            }
            
            const suggestedDrill = availableDrills.find(d => d.drillKey === data.drillKey);

            if (suggestedDrill) {
                toast({ title: 'AI Suggestion', description: data.reasoning });
                onStartDrill(suggestedDrill);
            } else {
                toast({ variant: 'destructive', title: 'Drill Not Found', description: `AI suggested a drill (${data.drillKey}) that could not be found.` });
            }
        });
    };

    if (isLoading) {
        return (
            <Card className="rounded-xl p-4 space-y-4">
                <SectionHeader title="Weekly Quests" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </Card>
        )
    }

    return (
        <Card className="rounded-xl p-4 space-y-4">
            <SectionHeader title="Weekly Quests" />
            <div className="space-y-2">
                {quests.map((quest, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${quest.isComplete ? 'text-score-good' : 'text-muted-foreground/50'}`} />
                    <span className={quest.isComplete ? 'text-foreground' : 'text-muted-foreground'}>
                    {quest.label}
                    </span>
                </div>
                ))}
            </div>
            <Button variant="outline" className="w-full" onClick={handleSuggestDrill} disabled={isSuggesting}>
                {isSuggesting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    'Start Suggested Drill'
                )}
                {!isSuggesting && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
        </Card>
    );
}
