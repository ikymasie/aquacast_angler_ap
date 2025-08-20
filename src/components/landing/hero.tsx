
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-teal-500 to-blue-700 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
            <div className="relative z-10 space-y-6 text-center md:text-left">
                 <Badge variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-sm">
                    Species-aware forecasts
                 </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold leading-tight">
                    Know When to Cast.
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto md:mx-0">
                    AquaCast translates complex weather data into a simple, actionable Fishing Success Score. Stop guessing, and start catching more fish.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                     <Button size="lg" asChild>
                       <Link href="/dashboard">Open Web App</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        Get the App
                    </Button>
                </div>
                 <div className="flex items-center justify-center md:justify-start gap-2 pt-4">
                    <span className="text-xs text-white/80">Powered by</span>
                    <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs">Open-Meteo</Badge>
                 </div>
            </div>
            <div className="relative hidden md:block h-full">
                {/* Placeholder for layered app mockups */}
                 <div className="absolute -right-16 -top-16 w-[320px] h-[640px] transform rotate-8">
                     <Image src="https://placehold.co/320x640.png" width={320} height={640} alt="App screen showing fishing forecast" className="rounded-2xl shadow-floating" data-ai-hint="app screenshot" />
                 </div>
                  <div className="absolute right-16 top-0 w-[320px] h-[640px] transform rotate-3">
                     <Image src="https://placehold.co/320x640.png" width={320} height={640} alt="App screen showing species success card" className="rounded-2xl shadow-floating" data-ai-hint="app screenshot fishing" />
                 </div>
            </div>
        </div>
    </section>
  );
}
