
'use client';

import { HeroBackground } from '@/components/onboarding/hero-background';
import { LogoRow } from '@/components/onboarding/logo-row';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div className="relative flex flex-col min-h-screen bg-background overflow-hidden">
            <HeroBackground 
                topCircleColor="bg-brand-deep-teal"
                bottomCircleColor="bg-brand-accent-orange"
            />
            
            <main className="relative z-10 flex flex-col flex-1 h-full px-6">
                <div className="flex-1 flex flex-col justify-center">
                    <div className="mt-16">
                        <LogoRow />
                    </div>

                    <div className="text-center mt-12 space-y-3">
                        <h1 className="font-headline text-[24px] leading-[30px] font-bold text-ink-900">
                            Fishing Forecasts that actually help you catch
                        </h1>
                        <p className="font-body text-sm leading-[22px] text-ink-500 max-w-sm mx-auto">
                            Species-aware forecasts, spot intel, and practice drills for bream, bass & carp.
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-3 pb-8">
                     <Button 
                        size="xl" 
                        className="w-full shadow-onboarding-cta"
                        onClick={() => router.push('/auth/create')}
                     >
                        Continue
                    </Button>
                     <Button 
                        size="xl" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/auth/recover')}
                    >
                        Recover Account
                    </Button>
                     <p className="text-center text-xs text-muted-foreground pt-2">
                        By continuing, you agree to our{' '}
                        <Link href="#" className="underline">Terms</Link> &{' '}
                        <Link href="#" className="underline">Privacy</Link>.
                    </p>
                </div>
            </main>
        </div>
    );
}

    