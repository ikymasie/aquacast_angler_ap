
'use client';

import { useState } from 'react';
import { SectionHeader } from './section-header';
import catalog from '@/lib/practice-catalog.json';
import { TechniqueCard } from './technique-card';
import { DrillCard } from './drill-card';
import { SpeciesSelector } from './species-selector';
import type { Species, LureFamily } from '@/lib/types';
import { LureSelector } from './lure-selector';
import { SessionHeader } from './practice/session-header';
import { cn } from '@/lib/utils';

export function PracticeTab() {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
  const [selectedLureFamily, setSelectedLureFamily] = useState<LureFamily | 'All'>('All');

  const { taxonomies, drillCatalog } = catalog;
  const { techniqueCatalog } = taxonomies;

  const handleLureSelect = (lure: LureFamily | 'All') => {
    setSelectedLureFamily(lure);
  };

  const filteredDrills = drillCatalog.filter(drill => {
      const speciesMatch = drill.speciesKeys.includes(selectedSpecies.toLowerCase());
      const lureFamilyMatch = selectedLureFamily === 'All' || drill.requiredFamilies.includes(selectedLureFamily.toLowerCase().replace('/','_'));
      return speciesMatch && lureFamilyMatch;
  });

  return (
    <div className="space-y-6">
      <SessionHeader />
      
      <div className="sticky top-0 z-10 bg-background py-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1">
              <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">with</p>
            <div className="flex-1">
              <LureSelector selectedLure={selectedLureFamily} onLureSelect={handleLureSelect as any} showAllOption />
            </div>
          </div>
      </div>
      
      <div>
        <SectionHeader title="Drills"/>
          <p className="text-muted-foreground text-sm mt-1">
              Select a species and lure family to see relevant drills.
          </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredDrills.map(drill => (
            <DrillCard key={drill.drillKey} drill={drill as any} />
          ))}
        </div>
        {filteredDrills.length === 0 && (
            <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg mt-4">
                <h3 className="text-lg font-semibold text-foreground">No Drills Found</h3>
                <p className="text-muted-foreground mt-2 text-sm">No drills match your selected species and lure family. Try a different combination.</p>
            </div>
        )}
      </div>

    </div>
  );
}
