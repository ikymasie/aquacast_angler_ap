'use client';

import { Sunrise, Sunset, CloudRain, Moon } from "lucide-react";
import type { Window } from "@/lib/types";

interface FactorTilesProps {
    windows: Window[];
}

export function FactorTiles({ windows }: FactorTilesProps) {
    const getWindow = (label: string) => windows.find(w => w.label === label);

    const factors = [
        { label: "Sunrise", icon: Sunrise, window: getWindow("Sunrise") },
        { label: "Rain", icon: CloudRain, window: getWindow("Rain") },
        { label: "Moon", icon: Moon, window: getWindow("Moon (new)") || getWindow("Moon (full)") },
        { label: "Sunset", icon: Sunset, window: getWindow("Sunset") },
    ];

    return (
        <div className="grid grid-cols-4 gap-2">
            {factors.map(({ label, icon: Icon, window }) => (
                <div 
                    key={label}
                    className="bg-white/10 rounded-lg p-2 text-center text-white flex flex-col items-center justify-center h-20 backdrop-blur-sm"
                >
                    <Icon className={`w-6 h-6 ${window ? 'text-primary-foreground' : 'text-white/50'}`} />
                    <span className={`mt-1 font-bold text-lg ${window ? 'text-primary-foreground' : 'text-white/50'}`}>
                        {window ? window.score : '—'}
                    </span>
                    <span className={`text-xs -mt-1 ${window ? 'text-white/80' : 'text-white/50'}`}>{label}</span>
                </div>
            ))}
        </div>
    );
}
