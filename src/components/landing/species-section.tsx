
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { ArrowUp } from 'lucide-react';

const speciesData = {
  bass: {
    title: 'Aggressive Bass, Ideal Conditions',
    description: 'Bass are ambush predators, and our algorithm knows they love overcast days with falling pressure before a front. We weigh these factors heavily to find you the perfect window.',
    factors: ['Overcast', 'Falling Pressure', 'Twilight Hours'],
    image: 'https://placehold.co/400x800.png',
    hint: 'bass fishing',
  },
  bream: {
    title: 'Stable Bream, Gentle Weather',
    description: 'Bream prefer stability. We look for consistent temperature and pressure, light winds, and highlight dawn and dusk periods when they actively feed.',
    factors: ['Stable Pressure', 'Light Wind', 'Warm Water'],
    image: 'https://placehold.co/400x800.png',
    hint: 'bream fishing',
  },
  carp: {
    title: 'Strategic Carp, Key Opportunities',
    description: 'Carp are sensitive to moon phases and water temperature. Our model identifies key feeding triggers, like a full moon combined with a stable high-pressure system.',
    factors: ['Full Moon', 'Rising Pressure', 'Warm Water'],
    image: 'https://placehold.co/400x800.png',
    hint: 'carp fishing',
  },
};

type Species = keyof typeof speciesData;

export function SpeciesSection() {
  const [activeSpecies, setActiveSpecies] = useState<Species>('bass');
  const data = speciesData[activeSpecies];

  return (
    <section id="species" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-ink-900">Built for Your Species</h2>
          <p className="mt-4 text-lg text-ink-500 max-w-2xl mx-auto">Different fish, different rules. AquaCast adapts its forecast to your target.</p>
        </div>
        <Tabs value={activeSpecies} onValueChange={(value) => setActiveSpecies(value as Species)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto h-12 rounded-full bg-secondary text-secondary-foreground">
            <TabsTrigger value="bass" className="h-10 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bass</TabsTrigger>
            <TabsTrigger value="bream" className="h-10 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bream</TabsTrigger>
            <TabsTrigger value="carp" className="h-10 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Carp</TabsTrigger>
          </TabsList>
          
          <div className="mt-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-center md:text-left">
                <h3 className="font-headline text-2xl md:text-3xl font-bold text-ink-900 mb-4">{data.title}</h3>
                <p className="text-ink-500 text-lg mb-6">{data.description}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {data.factors.map(factor => (
                        <Badge key={factor} variant="secondary" className="h-7 rounded-md bg-teal-100 text-teal-600 border-0 text-sm">
                           <ArrowUp className="w-3 h-3 mr-1.5"/>
                           {factor}
                        </Badge>
                    ))}
                </div>
              </div>
              <div className="flex justify-center">
                <Image 
                    src={data.image} 
                    alt={`App screenshot for ${activeSpecies}`}
                    width={300}
                    height={600}
                    className="rounded-2xl shadow-floating"
                    data-ai-hint={data.hint}
                />
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
