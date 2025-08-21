
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

  const { techniqueCatalog } = catalog.taxonomies;
  const { drillCatalog } = catalog;

  const handleLureSelect = (lure: LureFamily | 'All') => {
    setSelectedLureFamily(lure);
  }

  const filteredDrills = drillCatalog.filter(drill => {
    const speciesMatch = drill.speciesKeys.includes(selectedSpecies.toLowerCase());
    const lureFamilyMatch = selectedLureFamily === 'All' || (drill.requiredFamilies && drill.requiredFamilies.includes(selectedLureFamily));
    return speciesMatch && lureFamilyMatch;
  });


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} />
        <LureSelector selectedLure={selectedLureFamily} onLureSelect={handleLureSelect as any} showAllOption />
      </div>
      
      <div>
        <SectionHeader title="Drills" />
         <p className="text-muted-foreground text-sm mt-1">
            Apply your skills in focused drills.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filteredDrills.map(drill => (
                <DrillCard key={drill.drillKey} drill={drill as any} />
            ))}
        </div>
      </div>

       <div>
        <SectionHeader title="Technique Library" />
        <p className="text-muted-foreground text-sm mt-1">
          Browse techniques to improve your casting and presentation skills.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {techniqueCatalog.map(tech => (
            <TechniqueCard key={tech.techniqueKey} technique={tech as any} />
          ))}
        </div>
      </div>

    </div>
  );
}
