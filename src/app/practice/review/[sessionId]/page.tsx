
'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useEffect } from 'react';
import { getSessionReviewDataAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { PerformanceGauge } from '@/components/practice/review/performance-gauge';
import { GradeAndRewards } from '@/components/practice/review/grade-and-rewards';
import { KpiGrid } from '@/components/practice/review/kpi-grid';
import { AiInsightsCard } from '@/components/practice/review/ai-insights-card';
import { AttemptsTimeline } from '@/components/practice/review/attempts-timeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, RefreshCw, Share2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Card } from '@/components/ui/card';


function ReviewPageContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();
    const [reviewData, setReviewData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const sessionId = params.sessionId as string;

    useEffect(() => {
        if (user && sessionId) {
            const fetchData = async () => {
                setIsLoading(true);
                const result = await getSessionReviewDataAction({ userId: user.uid, sessionId });
                if (result.error || !result.data) {
                    toast({
                        variant: 'destructive',
                        title: 'Error loading review',
                        description: result.error || 'Could not find session data.',
                    });
                    router.replace('/');
                } else {
                    setReviewData(result.data);
                }
                setIsLoading(false);
            };
            fetchData();
        } else if (!user) {
            // Handle case where user is not loaded yet
        }

    }, [user, sessionId, router, toast]);

    const handleReplay = () => {
        toast({ title: 'Replay coming soon!' });
    };

    const handleDone = () => {
        router.push('/');
    };

    if (isLoading || !reviewData) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-[80px] w-full rounded-xl" />
                    <Skeleton className="h-[80px] w-full rounded-xl" />
                    <Skeleton className="h-[80px] w-full rounded-xl" />
                    <Skeleton className="h-[80px] w-full rounded-xl" />
                </div>
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        );
    }
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.4 } }
    };

    return (
        <>
            <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <PerformanceGauge
                        score={reviewData.session.finalScore}
                        band={reviewData.session.finalGrade}
                        drillName={reviewData.session.drillName}
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GradeAndRewards
                        grade={reviewData.session.finalGrade}
                        rewards={reviewData.rewards}
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <KpiGrid kpis={reviewData.kpis} drillType={reviewData.session.drillType || 'accuracy'} />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <AttemptsTimeline timeline={reviewData.timeline} />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card 
                        className="p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-secondary transition-colors"
                        onClick={() => setIsAnalysisOpen(true)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Lightbulb className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">View AquaCast Analysis</h3>
                                <p className="text-xs text-muted-foreground">AI-powered tips for your next session.</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
                <div className="flex justify-center items-center gap-2 max-w-md mx-auto">
                     <Button variant="outline" size="lg" onClick={handleReplay}>
                        <RefreshCw className="mr-2 h-4 w-4"/>
                        Replay
                    </Button>
                    <Button size="lg" onClick={handleDone} className="flex-1">
                        <Check className="mr-2 h-4 w-4"/>
                        Done
                    </Button>
                </div>
            </div>

            <AlertDialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center text-2xl font-headline mb-2">AquaCast Analysis</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AiInsightsCard insights={reviewData.insights} />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


export default function SessionReviewPage() {
    const router = useRouter();
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 md:p-6 pb-28">
                <Suspense fallback={<div>Loading...</div>}>
                    <ReviewPageContent />
                </Suspense>
            </main>
        </div>
    );
}
