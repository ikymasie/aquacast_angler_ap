
'use client';

import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import type { LureFamily } from "@/lib/types";
import Image from "next/image";


interface LureSelectorProps {
  selectedLure: LureFamily;
  onLureSelect: (lure: LureFamily) => void;
  disabled?: boolean;
}

const lureOptions: { name: LureFamily; image: string }[] = [
    { name: 'Live', image: '/images/baits/live.png' },
    { name: 'Crank/Swim', image: '/images/baits/crank.webp' },
    { name: 'Spinner', image: '/images/baits/spinner.webp' },
    { name: 'Soft', image: '/images/baits/soft.png' },
];

export function LureSelector({ selectedLure, onLureSelect, disabled }: LureSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {lureOptions.map(({ name, image }) => (
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
          <div className="relative h-8 w-8 mx-auto">
             <Image src={image} alt={name} layout="fill" objectFit="contain" />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-foreground">{name}</p>
        </Card>
      ))}
    </div>
  );
}
