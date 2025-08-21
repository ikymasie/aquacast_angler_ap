
'use client';

import { CastingConditionsCard } from '@/components/casting-conditions-card';
import { RecommendedSpotCard } from '@/components/recommended-spot-card';
import { LureSelector } from '@/components/lure-selector';
import { CastingAdvisorPanel } from '@/components/casting-advisor-panel';
import type { LureFamily } from '@/lib/types';
import type { LureAdviceOutput, CastingAdviceOutput } from '@/ai/flows/casting-advice-flow';

interface CastingTabProps {
    isLureAdviceLoading: boolean;
    isForecastLoading: boolean;
    lureAdvice: LureAdviceOutput | null;
    isAdviceLoading: boolean;
    advice: CastingAdviceOutput | null;
    selectedLure: LureFamily;
    onLureSelect: (lure: LureFamily) => void;
}

export function CastingTab({
    isLureAdviceLoading,
    isForecastLoading,
    lureAdvice,
    isAdviceLoading,
    advice,
    selectedLure,
    onLureSelect,
}: CastingTabProps) {
    return (
        <>
            <CastingConditionsCard 
                isLoading={isLureAdviceLoading || isForecastLoading}
                advice={lureAdvice}
            />
            <RecommendedSpotCard 
                isLoading={isAdviceLoading || isForecastLoading}
                advice={advice}
            />
            <LureSelector 
                selectedLure={selectedLure}
                onLureSelect={onLureSelect}
                disabled={isAdviceLoading || isForecastLoading || isLureAdviceLoading}
            />
            <CastingAdvisorPanel 
                isLoading={isAdviceLoading || isForecastLoading}
                advice={advice}
            />
        </>
    );
}
