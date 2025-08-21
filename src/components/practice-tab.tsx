
'use client';

import { useState } from 'react';
import { SectionHeader } from './section-header';
import catalog from '@/lib/practice-catalog.json';
import { TechniqueCard } from './technique-card';
import { DrillCard } from './drill-card';
import { SpeciesSelector } from './species-selector';
import type { Species, LureFamily } from '@/lib/types';
import { LureSelector } from './lure-selector';

export function PracticeTab() {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
  const [selectedLureFamily, setSelectedLureFamily] = useState<LureFamily | 'All'>('All');

  const { families } = catalog;

  const handleLureSelect = (lure: LureFamily | 'All') => {
    setSelectedLureFamily(lure);
  };

  const filteredFamilies = families.filter(family => {
      const speciesMatch = family.supportedSpecies.includes(selectedSpecies.toLowerCase());
      const lureFamilyMatch = selectedLureFamily === 'All' || family.familyKey === selectedLureFamily.toLowerCase().replace('/','_');
      return speciesMatch && lureFamilyMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1">
          <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">with</p>
        <div className="flex-1">
          <LureSelector selectedLure={selectedLureFamily} onLureSelect={handleLureSelect as any} showAllOption />
        </div>
      </div>
      
      {filteredFamilies.map(family => (
        <div key={family.familyKey}>
          <SectionHeader title={`${family.label} Drills`} />
          <p className="text-muted-foreground text-sm mt-1">
              Apply your skills in focused drills for the {family.label} family.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {family.drills.map(drill => (
                  <DrillCard key={drill.drillKey} drill={drill as any} />
              ))}
          </div>

          <div className="mt-6">
            <h4 className="font-headline text-md font-semibold text-foreground">Core Techniques for {family.label}</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {family.coreTechniques.map(tech => (
                <TechniqueCard key={tech.techniqueKey} technique={tech as any} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {filteredFamilies.length === 0 && (
        <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-foreground">No Drills Found</h3>
            <p className="text-muted-foreground mt-2 text-sm">No drills match your selected species and lure family. Try a different combination.</p>
        </div>
      )}
    </div>
  );
}
