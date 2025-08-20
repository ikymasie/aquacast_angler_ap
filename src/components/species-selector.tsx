'use client';

import { Button } from "@/components/ui/button";
import type { Species } from "@/lib/types";
import { FishBassIcon } from "@/components/icons/fish-bass";
import { FishBreamIcon } from "@/components/icons/fish-bream";
import { FishCarpIcon } from "@/components/icons/fish-carp";
import { cn } from "@/lib/utils";

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
          variant="outline"
          onClick={() => onSelectSpecies(name)}
          className={cn(
            "h-9 px-4 rounded-full border-white/30 text-white transition-colors duration-200 backdrop-blur-sm",
            "bg-white/10 hover:bg-white/20",
            "data-[state=active]:bg-white/25 data-[state=active]:border-white/50 data-[state=active]:font-semibold",
            "disabled:bg-white/10 disabled:text-white/50"
          )}
          data-state={selectedSpecies === name ? 'active' : 'inactive'}
          disabled={disabled}
        >
          <Icon className="h-5 w-5 mr-2" />
          <span className="text-sm">{name}</span>
        </Button>
      ))}
    </div>
  );
}
