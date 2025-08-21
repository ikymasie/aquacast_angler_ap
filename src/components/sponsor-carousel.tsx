
'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { SectionHeader } from "./section-header";

const sponsors = [
  { name: "TackleBox Pro", logo: "https://placehold.co/120x60.png", hint: "fishing gear logo" },
  { name: "Reel Deals", logo: "https://placehold.co/120x60.png", hint: "fishing shop logo" },
  { name: "Outdoor Adventures", logo: "https://placehold.co/120x60.png", hint: "adventure gear logo" },
  { name: "Piscari", logo: "https://placehold.co/120x60.png", hint: "fishing brand logo" },
  { name: "Aqua Marine", logo: "https://placehold.co/120x60.png", hint: "boating logo" },
  { name: "The Bait Shop", logo: "https://placehold.co/120x60.png", hint: "bait shop logo" },
];

export function SponsorCarousel() {
  return (
    <div className="space-y-3">
      <SectionHeader title="Our Sponsors" />
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {sponsors.map((sponsor, index) => (
            <CarouselItem key={index} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className="p-1">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="flex aspect-video items-center justify-center p-2">
                     <Image 
                        src={sponsor.logo}
                        alt={`${sponsor.name} logo`}
                        width={120}
                        height={60}
                        className="object-contain"
                        data-ai-hint={sponsor.hint}
                     />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}
