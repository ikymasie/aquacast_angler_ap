
'use client';

import { SectionHeader } from './section-header';
import catalog from '@/lib/practice-catalog.json';
import { TechniqueCard } from './technique-card';
import { DrillCard } from './drill-card';

export function PracticeTab() {
  const { techniqueCatalog, drillCatalog } = catalog;

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader title="Available Drills" />
        <p className="text-muted-foreground text-sm mt-1">
            Select a drill to start practicing and track your progress.
        </p>
        <div className="space-y-3 mt-4">
            {drillCatalog.map(drill => (
                <DrillCard key={drill.drillKey} drill={drill as any} />
            ))}
        </div>
      </div>

       <div>
        <SectionHeader title="Technique Library" />
         <p className="text-muted-foreground text-sm mt-1">
            Browse techniques to see which drills can help you improve.
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

    