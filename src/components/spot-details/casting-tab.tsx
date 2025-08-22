
'use client';

import { CastingConditionsCard } from '@/components/casting-conditions-card';
import { RecommendedSpotCard } from '@/components/recommended-spot-card';
import { LureSelector } from '@/components/lure-selector';
import { CastingAdvisorPanel } from '@/components/casting-advisor-panel';
import type { LureFamily, Species } from '@/lib/types';
import type { CastingAdviceOutput } from '@/ai/flows/casting-advice-flow';
import type { LureAdviceOutput } from '@/ai/flows/lure-advice-flow';
import { SpeciesSelector } from '../species-selector';

interface CastingTabProps {
    isLureAdviceLoading: boolean;
    isForecastLoading: boolean;
    lureAdvice: LureAdviceOutput | null;
    isAdviceLoading: boolean;
    advice: CastingAdviceOutput | null;
    selectedLure: LureFamily;
    onLureSelect: (lure: LureFamily) => void;
    selectedSpecies: Species;
    onSelectSpecies: (species: Species) => void;
}

export function CastingTab({
    isLureAdviceLoading,
    isForecastLoading,
    lureAdvice,
    isAdviceLoading,
    advice,
    selectedLure,
    onLureSelect,
    selectedSpecies,
    onSelectSpecies,
}: CastingTabProps) {
    const isLoading = isLureAdviceLoading || isForecastLoading || isAdviceLoading;
    return (
        <>
            <CastingConditionsCard 
                isLoading={isLoading}
                advice={lureAdvice}
            />
            <RecommendedSpotCard 
                isLoading={isLoading}
                advice={advice}
            />
             <SpeciesSelector 
               selectedSpecies={selectedSpecies}
               onSelectSpecies={onSelectSpecies}
               disabled={isLoading}
            />
            <LureSelector 
                selectedLure={selectedLure}
                onLureSelect={onLureSelect}
                disabled={isLoading}
            />
            <CastingAdvisorPanel 
                isLoading={isLoading}
                advice={advice}
            />
        </>
    );
}
