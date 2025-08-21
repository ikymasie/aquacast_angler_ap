
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Header } from '@/components/header';
import { SectionHeader } from '@/components/section-header';
import { DrillCard } from '@/components/drill-card';
import { SpeciesSelector } from '@/components/species-selector';
import type { Species, LureFamily } from '@/lib/types';
import { LureSelector } from '@/components/lure-selector';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionSetupSheet } from '@/components/practice/session-setup-sheet';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { startPracticeSessionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { usePracticeState } from '@/hooks/use-practice-state';
import { RankBanner } from '../progress/rank-banner';
import { WeeklyOverviewCard } from '../progress/weekly-overview-card';
import { SkillWheel } from '../progress/skill-wheel';
import { DrillOverviewCarousel } from '../progress/drill-overview-carousel';
import { MasteryOverview } from '../progress/mastery-overview';
import { TrendsChart } from '../progress/trends-chart';

export function ProgressTab({ isInsideSpotDetails = false }: { isInsideSpotDetails?: boolean }) {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('Bream');
  const [selectedLureFamily, setSelectedLureFamily] = useState<LureFamily | 'All'>('All');
  const [catalog, setCatalog] = useState<any>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isStartingSession, startSessionTransition] = useTransition();
  const [drillForSetup, setDrillForSetup] = useState<any | null>(null);
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const { setActiveDrill } = usePracticeState();


  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoadingCatalog(true);
      try {
        const speciesKey = selectedSpecies.toLowerCase();
        const catalogModule = await import(`@/lib/practice-catalog-${speciesKey}.json`);
        setCatalog(catalogModule.default);
      } catch (error) {
        console.error(`Failed to load catalog for ${selectedSpecies}:`, error);
        try {
            const fallbackModule = await import(`@/lib/practice-catalog-bream.json`);
            setCatalog(fallbackModule.default);
        } catch (fallbackError) {
            console.error('Failed to load fallback catalog:', fallbackError);
            setCatalog(null);
        }
      } finally {
        setIsLoadingCatalog(false);
      }
    };

    loadCatalog();
  }, [selectedSpecies]);


  const handleLureSelect = (lure: LureFamily | 'All') => {
    setSelectedLureFamily(lure);
  };
  
  const handleStartDrill = (drill: any) => {
    setDrillForSetup(drill);
  };

  const handleBeginFromSheet = () => {
    if (!drillForSetup || !user) {
        toast({ variant: 'destructive', title: 'Could not start session', description: 'User or drill data is missing.' });
        return;
    }

    startSessionTransition(async () => {
        const speciesKey = selectedSpecies.toLowerCase();
        const drillData = { ...drillForSetup, speciesKey };

        const { data: sessionData, error } = await startPracticeSessionAction({
            userId: user.uid,
            drill: drillData,
        });

        if (error || !sessionData) {
            toast({ variant: 'destructive', title: 'Failed to Start', description: error || 'Could not create a new practice session.' });
            return;
        }

        const fullDrillData = { ...drillData, sessionId: sessionData.sessionId };

        // Set the active drill in our shared state
        setActiveDrill(fullDrillData);
        
        // Navigate to the dynamic route
        router.push(`/practice/${drillData.drillKey}`);
        setDrillForSetup(null);
    });
  };

  const allDrills = catalog?.speciesCatalog?.families?.flatMap((family: any) => family.drills) || [];

  const filteredDrills = selectedLureFamily === 'All'
    ? allDrills
    : catalog?.speciesCatalog?.families
        ?.find((family: any) => family.label.toLowerCase().includes(selectedLureFamily.toLowerCase().split('/')[0]))
        ?.drills || [];

  const MainContent = () => (
    <div className="space-y-6">
      {!isInsideSpotDetails && <RankBanner />}
      <WeeklyOverviewCard />
      <SkillWheel />
      <DrillOverviewCarousel />
      <MasteryOverview />
      <TrendsChart />
      
      <div className={cn(!isInsideSpotDetails && "sticky top-[56px] z-10 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 border-b")}>
          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
               <p className="text-sm font-medium text-muted-foreground">Show drills for</p>
              <SpeciesSelector selectedSpecies={selectedSpecies} onSelectSpecies={setSelectedSpecies} />
               <p className="text-sm font-medium text-muted-foreground mt-2">using</p>
              <LureSelector selectedLure={selectedLureFamily} onLureSelect={handleLureSelect as any} showAllOption />
          </div>
      </div>
      
      <div>
        <SectionHeader title="Recommended Drills"/>
          <p className="text-muted-foreground text-sm mt-1">
              Select a species and lure to see relevant drills.
          </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {isLoadingCatalog ? (
                <>
                    <Skeleton className="h-[150px] w-full rounded-xl" />
                    <Skeleton className="h-[150px] w-full rounded-xl" />
                </>
            ) : filteredDrills.length > 0 ? (
                filteredDrills.map((drill: any) => (
                    <DrillCard key={drill.drillKey} drill={drill} onStart={handleStartDrill} />
                ))
            ) : (
                 <div className="col-span-1 md:col-span-2 text-center py-10 px-4 border-2 border-dashed rounded-lg mt-4">
                    <h3 className="text-lg font-semibold text-foreground">No Drills Found</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Try a different combination of species and lure family.</p>
                </div>
            )}
        </div>
      </div>
       <SessionSetupSheet 
          drill={drillForSetup}
          isOpen={!!drillForSetup}
          onOpenChange={(isOpen) => !isOpen && setDrillForSetup(null)}
          onBegin={handleBeginFromSheet}
          isPending={isStartingSession}
       />
    </div>
  );

  if (isInsideSpotDetails) {
    return <MainContent />;
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 pb-24 overflow-y-auto space-y-4">
         <SectionHeader title="Progress" />
         <MainContent />
      </main>
    </>
  );
}
