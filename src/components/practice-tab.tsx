
'use client';

import { useState } from 'react';
import { SectionHeader } from './section-header';
import catalog from '@/lib/practice-catalog.json';
import { TechniqueCard } from './technique-card';
import { DrillCard } from './drill-card';
import { SpeciesSelector } from './species-selector';
import type { Species } from '@/lib/types';


export function PracticeTab() {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bass');
  const { techniqueCatalog, drillCatalog } = catalog;

  return (
    <div className="space-y-6">
      <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} />
      
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

       <div>
        <SectionHeader title="Drills" />
         <p className="text-muted-foreground text-sm mt-1">
            Apply your skills in focused drills.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {drillCatalog.map(drill => (
                <DrillCard key={drill.drillKey} drill={drill as any} />
            ))}
        </div>
      </div>

    </div>
  );
}

    