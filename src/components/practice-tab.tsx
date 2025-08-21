
'use client';

import { SectionHeader } from './section-header';
import catalog from '@/lib/practice-catalog.json';
import { TechniqueCard } from './technique-card';

export function PracticeTab() {
  const { techniqueCatalog } = catalog.taxonomies;

  return (
    <div className="space-y-6">
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

    