'use client';

import { Button } from "@/components/ui/button";
import type { Species } from "@/lib/types";
import { FishBassIcon } from "@/components/icons/fish-bass";
import { FishBreamIcon } from "@/components/icons/fish-bream";
import { FishCarpIcon } from "@/components/icons/fish-carp";

interface SpeciesSelectorProps {
  selectedSpecies: Species;
  onSelectSpecies: (species: Species) => void;
  disabled?: boolean;
}

const speciesOptions: { name: Species; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { name: 'Bass', icon: FishBassIcon },
  { name: 'Bream', icon: FishBreamIcon },
  { name: 'Carp', icon: FishCarpIcon },
];

export function SpeciesSelector({ selectedSpecies, onSelectSpecies, disabled }: SpeciesSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {speciesOptions.map(({ name, icon: Icon }) => (
        <Button
          key={name}
          variant={selectedSpecies === name ? "default" : "outline"}
          size="lg"
          onClick={() => onSelectSpecies(name)}
          className={`flex-1 md:flex-initial transition-all duration-200 transform hover:scale-105 ${selectedSpecies === name ? 'shadow-lg' : ''}`}
          disabled={disabled}
        >
          <Icon className="h-6 w-6 mr-2" />
          <span className="text-base">{name}</span>
        </Button>
      ))}
    </div>
  );
}
