
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
    
    const activeIndex = navItems.findIndex(item => item.active);
    const notchPosition = activeIndex !== -1 ? `${(100 / navItems.length) * (activeIndex + 0.5)}%` : '50%';


    return (
        <footer className="sticky bottom-0 z-50 w-full p-3 bg-transparent pointer-events-none">
            <div className="safe-area-pb pointer-events-auto relative bg-card shadow-floating rounded-xl h-[68px] flex items-center justify-around">
                 <div 
                    className="absolute -top-[10px] left-0 w-full h-[10px] flex justify-center"
                    style={{
                        transform: `translateX(calc(${notchPosition} - 50%))`
                    }}
                >
                    <div 
                        className="w-[72px] h-[36px] absolute -top-[1px] "
                        style={{ left: `calc(50% - 36px)` }}
                    >
                        <div 
                            className="w-full h-[72px] rounded-full bg-primary absolute -bottom-14"
                        ></div>
                    </div>
                </div>

                {navItems.map((item, index) => (
                    <Link key={item.label} href={item.href} className="z-10 flex min-w-[56px] flex-col items-center justify-center gap-1 text-center" aria-label={item.label}>
                        <item.icon className={cn("h-6 w-6", item.active ? 'text-primary-dark' : 'text-ink-300/70')} />
                        <span className={cn("text-xs font-medium", item.active ? 'text-primary-dark' : 'text-ink-300')}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
             <style jsx>{`
                .safe-area-pb {
                    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
                }
            `}</style>
        </footer>
    );
}
