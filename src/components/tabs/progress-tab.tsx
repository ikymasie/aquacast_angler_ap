
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
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
import { startPracticeSessionAction, getPracticeSessionsAction, getOrGenerateWeeklyQuestsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { usePracticeState } from '@/hooks/use-practice-state';
import { RankBanner } from '../progress/rank-banner';
import { WeeklyOverviewCard } from '../progress/weekly-overview-card';
import { SkillWheel } from '../progress/skill-wheel';
import { DrillOverviewCarousel } from '../progress/drill-overview-carousel';
import { MasteryOverview } from '../progress/mastery-overview';
import { TrendsChart } from '../progress/trends-chart';
import { AiCoachCard } from '../progress/ai-coach-card';
import { QuestsCard } from '../progress/quests-card';
import { HistoryCard } from '../progress/history-card';
import { differenceInDays, startOfWeek, format, addDays, isSameDay, differenceInMinutes, parseISO, subDays, isAfter } from 'date-fns';

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

  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [quests, setQuests] = useState<any[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);


  useEffect(() => {
    if (user) {
      const fetchSessions = async () => {
        setIsLoadingSessions(true);
        const { data } = await getPracticeSessionsAction(user.uid);
        setSessions(data || []);
        setIsLoadingSessions(false);
      };
      const fetchQuests = async () => {
          setIsLoadingQuests(true);
          const { data } = await getOrGenerateWeeklyQuestsAction(user.uid);
          setQuests(data || []);
          setIsLoadingQuests(false);
      };
      fetchSessions();
      fetchQuests();
    }
  }, [user]);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const thisWeeksSessions = sessions.filter(s => {
        if (!s.startTime) return false;
        const startTimeDate = parseISO(s.startTime);
        return differenceInDays(now, startTimeDate) <= 7;
    });

    const totalCasts = thisWeeksSessions.reduce((sum, s) => sum + (s.rounds?.reduce((rSum: number, r: any) => rSum + r.attempts.length, 0) || 0), 0);
    
    const totalMinutes = thisWeeksSessions.reduce((sum, s) => {
        if (!s.startTime || !s.endTime) return sum;
        const startTimeDate = parseISO(s.startTime);
        const endTimeDate = parseISO(s.endTime);
        return sum + differenceInMinutes(endTimeDate, startTimeDate);
    }, 0);
    
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
    const trend = Array(7).fill(0).map((_, i) => {
        const day = addDays(startOfThisWeek, i);
        const dayStr = format(day, 'E');
        const dayCasts = thisWeeksSessions
            .filter(s => s.startTime && isSameDay(parseISO(s.startTime), day))
            .reduce((sum, s) => sum + (s.rounds?.reduce((rSum: number, r: any) => rSum + r.attempts.length, 0) || 0), 0);
        return { day: dayStr.charAt(0), casts: dayCasts };
    });

    return {
      sessions: thisWeeksSessions.length,
      minutes: totalMinutes,
      casts: totalCasts,
      streak: user?.practiceProfile?.streak || 0,
      band: "Good", // Placeholder
      trend,
    }
  }, [sessions, user]);
  
  const skillData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const recentSessions = sessions.filter(s => {
      if (!s.startTime) return false;
      const startTimeDate = parseISO(s.startTime);
      return isAfter(startTimeDate, thirtyDaysAgo);
    });

    if (recentSessions.length === 0) {
      return [
        { skill: 'Accuracy', A: 20, fullMark: 100 },
        { skill: 'Quiet Entry', A: 20, fullMark: 100 },
        { skill: 'Cadence', A: 20, fullMark: 100 },
        { skill: 'Lane/Edge', A: 20, fullMark: 100 },
        { skill: 'Distance', A: 20, fullMark: 100 },
        { skill: 'Grouping', A: 20, fullMark: 100 },
        { skill: 'Timing', A: 20, fullMark: 100 },
      ];
    }
    
    const allAttempts = recentSessions.flatMap(s => s.rounds?.flatMap((r:any) => r.attempts) || []);
    
    const getAverageScore = () => {
        if (allAttempts.length === 0) return 0;
        const totalPoints = allAttempts.reduce((sum, attempt) => sum + (attempt.points || 0), 0);
        return Math.round(totalPoints / allAttempts.length);
    }
    
    const averageSkillScore = getAverageScore();

    // Distribute score with some variance for visual effect
    return [
      { skill: 'Accuracy', A: averageSkillScore + 5, fullMark: 100 },
      { skill: 'Quiet Entry', A: averageSkillScore - 3, fullMark: 100 },
      { skill: 'Cadence', A: averageSkillScore, fullMark: 100 },
      { skill: 'Lane/Edge', A: averageSkillScore - 8, fullMark: 100 },
      { skill: 'Distance', A: averageSkillScore + 2, fullMark: 100 },
      { skill: 'Grouping', A: averageSkillScore - 5, fullMark: 100 },
      { skill: 'Timing', A: averageSkillScore + 3, fullMark: 100 },
    ].map(skill => ({ ...skill, A: Math.max(15, Math.min(95, skill.A)) })); // Clamp values

  }, [sessions]);

  const sevenDayTrends = useMemo(() => {
    const now = new Date();
    const today = startOfWeek(now, { weekStartsOn: 1 });
    const last7Days = Array(7).fill(0).map((_, i) => addDays(today, i));

    const trendData = {
        accuracyPct: [] as { day: string; value: number }[],
        inBandPct: [] as { day: string; value: number }[],
        laneTimePct: [] as { day: string; value: number }[],
    };

    last7Days.forEach(day => {
        const dayStr = format(day, 'E');
        const sessionsForDay = sessions.filter(s => s.startTime && isSameDay(parseISO(s.startTime), day));
        const attemptsForDay = sessionsForDay.flatMap(s => s.rounds?.flatMap((r: any) => r.attempts) || []);

        if (attemptsForDay.length === 0) {
            trendData.accuracyPct.push({ day: dayStr, value: 0 });
            trendData.inBandPct.push({ day: dayStr, value: 0 });
            trendData.laneTimePct.push({ day: dayStr, value: 0 });
            return;
        }

        const accuracy = Math.round(
            (attemptsForDay.filter(a => a.outcome === 'hit').length / attemptsForDay.length) * 100
        );
        const avgScore = attemptsForDay.reduce((sum, a) => sum + (a.points || 0), 0) / attemptsForDay.length;
        const inBand = Math.round(avgScore * 0.8);
        const laneTime = Math.round(avgScore * 0.7);

        trendData.accuracyPct.push({ day: dayStr, value: accuracy });
        trendData.inBandPct.push({ day: dayStr, value: inBand });
        trendData.laneTimePct.push({ day: dayStr, value: laneTime });
    });

    return trendData;
}, [sessions]);

  const recentDrills = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const drills = completedSessions.reduce((acc, session) => {
        if (!acc[session.drillKey]) {
            acc[session.drillKey] = [];
        }
        acc[session.drillKey].push(session);
        return acc;
    }, {} as Record<string, any[]>);

    return Object.values(drills).map(drillSessions => {
        const lastSession = drillSessions[0];
        const allAttempts = lastSession.rounds?.flatMap((r:any) => r.attempts) || [];
        const hitsStrip = allAttempts.slice(-10).map((a:any) => a.outcome === 'hit' ? '1' : '0').join('');
        const bestGrade = drillSessions.reduce((best, s) => {
            if (!s.finalGrade) return best;
            if (!best) return s.finalGrade;
            return s.finalGrade < best ? s.finalGrade : best;
        }, null) || 'N/A';

        return {
            drillKey: lastSession.drillKey,
            species: lastSession.speciesKey || 'unknown',
            family: 'unknown',
            bestGrade,
            lastScore: lastSession.finalScore || 0,
            hitsStrip,
        };
    }).slice(0, 5);
  }, [sessions]);

  const masteryData = useMemo(() => {
    const allSpecies = ['Bream', 'Bass', 'Carp'];
    const speciesMastery = allSpecies.map(s => ({
        key: s.toLowerCase(),
        name: s,
        pct: 0,
        topSkill: "N/A",
        image: `/images/fish/${s.toLowerCase()}.webp`
    }));

    if (sessions.length === 0 || !catalog) {
      return { speciesMastery, familyMastery: [] };
    }
    
    const getFamilyForDrill = (drillKey: string) => {
        for (const family of catalog.speciesCatalog.families) {
            if (family.drills.some((d: any) => d.drillKey === drillKey)) {
                return family.familyKey;
            }
        }
        return 'unknown';
    };

    const getAverageScore = (sessionList: any[]) => {
      const allAttempts = sessionList.flatMap(s => s.rounds?.flatMap((r: any) => r.attempts) || []);
      if (allAttempts.length === 0) return 0;
      const totalPoints = allAttempts.reduce((sum, attempt) => sum + (attempt.points || 0), 0);
      return Math.round(totalPoints / allAttempts.length);
    };

    // Species Mastery
    const speciesGroups = sessions.reduce((acc, session) => {
      const key = session.speciesKey || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    }, {} as Record<string, any[]>);

    allSpecies.forEach((s, index) => {
        const key = s.toLowerCase();
        const speciesSessions = speciesGroups[key] || [];
        const pct = getAverageScore(speciesSessions);
        speciesMastery[index] = {
            ...speciesMastery[index],
            pct,
            topSkill: pct > 0 ? "Quiet Entry" : "N/A", // Placeholder
        };
    });

    // Family Mastery
    const familyGroups = sessions.reduce((acc, session) => {
      const key = getFamilyForDrill(session.drillKey);
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    }, {} as Record<string, any[]>);
    
    const familyMastery = Object.keys(familyGroups).map(key => {
      const familySessions = familyGroups[key];
      const familyInfo = catalog.speciesCatalog.families.find((f: any) => f.familyKey === key);
      return {
        key: key,
        name: familyInfo?.label || key,
        pct: getAverageScore(familySessions),
        image: `/images/baits/${key.toLowerCase().split('/')[0]}.webp`
      }
    });

    return { speciesMastery, familyMastery };

  }, [sessions, catalog]);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoadingCatalog(true);
      try {
        const [bream, bass, carp] = await Promise.all([
            import(`@/lib/practice-catalog-bream.json`),
            import(`@/lib/practice-catalog-bass.json`),
            import(`@/lib/practice-catalog-carp.json`)
        ]);
        
        const mergedFamilies = [
            ...bream.default.speciesCatalog.families,
            ...bass.default.speciesCatalog.families,
            ...carp.default.speciesCatalog.families,
        ];

        const mergedCatalog = {
            speciesCatalog: {
                families: mergedFamilies.reduce((acc, family) => {
                    const existing = acc.find((f: any) => f.familyKey === family.familyKey);
                    if (existing) {
                        existing.drills = [...existing.drills, ...family.drills];
                    } else {
                        acc.push(family);
                    }
                    return acc;
                }, [] as any[])
            }
        };
        
        setCatalog(mergedCatalog);

      } catch (error) {
        console.error(`Failed to load catalogs:`, error);
        setCatalog(null);
      } finally {
        setIsLoadingCatalog(false);
      }
    };

    loadCatalog();
  }, []);

  const allDrills = useMemo(() => {
      if (!catalog) return [];
      return catalog.speciesCatalog.families.flatMap((family: any) => family.drills);
  }, [catalog]);

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
        setActiveDrill(fullDrillData);
        router.push(`/practice/${drillData.drillKey}`);
        setDrillForSetup(null);
    });
  };

  const drillsForSelectedSpecies = useMemo(() => {
    if (!catalog) return [];
    const drills = catalog.speciesCatalog.families
        .flatMap((family: any) => family.drills.map((d: any) => ({ ...d, familyKey: family.familyKey })));

    let filteredBySpecies = drills.filter((drill: any) => drill.drillKey.includes(selectedSpecies.toLowerCase()));
    
    if (selectedLureFamily === 'All') {
        return filteredBySpecies;
    }

    return filteredBySpecies.filter((drill: any) => drill.familyKey.toLowerCase().includes(selectedLureFamily.toLowerCase().split('/')[0]));

  }, [catalog, selectedLureFamily, selectedSpecies]);


  const MainContent = () => (
    <div className="space-y-6">
      <RankBanner
        isLoading={isUserLoading || isLoadingSessions}
        rankPoints={user?.practiceProfile?.xp || 0}
        nextRankPoints={user?.practiceProfile?.nextLevelXp || 1000}
        level={user?.practiceProfile?.level || 1}
      />
      <WeeklyOverviewCard {...weeklyStats} />
      <SkillWheel data={skillData} />
      <DrillOverviewCarousel drills={recentDrills} />
      <MasteryOverview
        speciesMastery={masteryData.speciesMastery}
        familyMastery={masteryData.familyMastery}
      />
      <TrendsChart trends={sevenDayTrends} />
      <AiCoachCard />
      <QuestsCard 
        quests={quests} 
        isLoading={isLoadingQuests}
        availableDrills={allDrills}
        onStartDrill={handleStartDrill}
      />
      <HistoryCard />
      
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
            ) : drillsForSelectedSpecies.length > 0 ? (
                drillsForSelectedSpecies.map((drill: any) => (
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
