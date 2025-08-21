
'use client';

import type { Species } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import Image from "next/image";

interface SpeciesSelectorProps {
  selectedSpecies: Species;
  onSelectSpecies: (species: Species) => void;
  disabled?: boolean;
}

const speciesOptions: { name: Species; image: string }[] = [
  { name: 'Bream', image: '/images/fish/bream.png' },
  { name: 'Bass', image: '/images/fish/bass.webp' },
  { name: 'Carp', image: '/images/fish/carp.png' },
];

export function SpeciesSelector({ selectedSpecies, onSelectSpecies, disabled }: SpeciesSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {speciesOptions.map(({ name, image }) => (
        <Card
          key={name}
          onClick={() => !disabled && onSelectSpecies(name)}
          className={cn(
            "p-3 rounded-lg text-center cursor-pointer transition-all duration-150",
            "border border-line-200 bg-white shadow-card hover:shadow-floating",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            selectedSpecies === name && "border-primary ring-2 ring-primary ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          role="button"
          aria-pressed={selectedSpecies === name}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="relative h-8 w-8 mx-auto">
            <Image src={image} alt={name} layout="fill" objectFit="contain" />
          </div>
          <p className="mt-2 text-xs font-semibold text-foreground">{name}</p>
        </Card>
      ))}
    </div>
  );
}
