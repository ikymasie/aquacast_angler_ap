
'use client'

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Home, Map, Search, Star } from "lucide-react";
import Link from "next/link";

const navItems = [
    { href: '#', icon: Home, label: 'Home', active: true },
    { href: '#', icon: Star, label: 'Favorites' },
    { href: '#', icon: Search, label: 'Search' },
    { href: '#', icon: Map, label: 'Maps' },
]

export function BottomNav() {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return null;
    }

    return (
        <footer className="sticky bottom-0 z-50 w-full p-3 bg-transparent pointer-events-none">
            <div className="safe-area-pb pointer-events-auto relative bg-card shadow-floating rounded-[20px] h-[68px] flex items-center justify-around">
                {navItems.map((item) => (
                    <Link key={item.label} href={item.href} className="flex min-w-[56px] flex-col items-center justify-center gap-1 text-center" aria-label={item.label}>
                        <item.icon className={cn("h-6 w-6", item.active ? 'text-teal-600' : 'text-ink-300/70')} />
                        <span className={cn("text-xs font-medium", item.active ? 'text-teal-600' : 'text-ink-300')}>
                            {item.label}
                        </span>
                    </Link>
                ))}
                 <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[72px] h-[36px] overflow-hidden" style={{transform: `translateX(-${(100/navItems.length) * (navItems.length/2 - navItems.findIndex(i => i.active))}%)`}}>
                    <div className="w-full h-[72px] rounded-full bg-primary absolute -bottom-12"></div>
                </div>
            </div>
             <style jsx>{`
                .safe-area-pb {
                    padding-bottom: env(safe-area-inset-bottom, 8px);
                }
            `}</style>
        </footer>
    );
}
