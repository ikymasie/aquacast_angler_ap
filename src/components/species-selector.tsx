
'use client';

import { Button } from "@/components/ui/button";
import type { Species } from "@/lib/types";
import { FishBassIcon } from "@/components/icons/fish-bass";
import { FishBreamIcon } from "@/components/icons/fish-bream";
import { FishCarpIcon } from "@/components/icons/fish-carp";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

interface SpeciesSelectorProps {
  selectedSpecies: Species;
  onSelectSpecies: (species: Species) => void;
  disabled?: boolean;
}

const speciesOptions: { name: Species; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { name: 'Bream', icon: FishBreamIcon },
  { name: 'Bass', icon: FishBassIcon },
  { name: 'Carp', icon: FishCarpIcon },
];

export function SpeciesSelector({ selectedSpecies, onSelectSpecies, disabled }: SpeciesSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {speciesOptions.map(({ name, icon: Icon }) => (
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
          <Icon className="h-8 w-8 mx-auto text-foreground/80" />
          <p className="mt-2 text-xs font-semibold text-foreground">{name}</p>
        </Card>
      ))}
    </div>
  );
}
