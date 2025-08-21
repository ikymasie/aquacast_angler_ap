
'use client';

import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import type { LureFamily } from "@/lib/types";
import { LureCrankSwimIcon } from './icons/lure-crank-swim';
import { LureLiveIcon } from './icons/lure-live';
import { LureSoftIcon } from './icons/lure-soft';
import { LureSpinnerIcon } from './icons/lure-spinner';

interface LureSelectorProps {
  selectedLure: LureFamily;
  onLureSelect: (lure: LureFamily) => void;
  disabled?: boolean;
}

const lureOptions: { name: LureFamily; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { name: 'Live', icon: LureLiveIcon },
    { name: 'Crank/Swim', icon: LureCrankSwimIcon },
    { name: 'Spinner', icon: LureSpinnerIcon },
    { name: 'Soft', icon: LureSoftIcon },
];

export function LureSelector({ selectedLure, onLureSelect, disabled }: LureSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {lureOptions.map(({ name, icon: Icon }) => (
        <Card
          key={name}
          onClick={() => !disabled && onLureSelect(name)}
          className={cn(
            "p-3 rounded-lg text-center cursor-pointer transition-all duration-150",
            "border border-line-200 bg-white shadow-sm hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            selectedLure === name && "border-primary bg-primary/10 ring-2 ring-primary ring-offset-background",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          role="button"
          aria-pressed={selectedLure === name}
          tabIndex={disabled ? -1 : 0}
        >
          <Icon className="h-6 w-6 mx-auto text-foreground/70" />
          <p className="mt-2 text-[11px] font-semibold text-foreground">{name}</p>
        </Card>
      ))}
    </div>
  );
}
