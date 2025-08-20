'use client'

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Home, Map, Search, Star } from "lucide-react";
import Link from "next/link";

const navItems = [
    { href: '/', icon: Home, label: 'Home', active: true },
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
        <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm">
            <div className="safe-area-pb">
                <nav className="flex h-16 items-center justify-around rounded-t-xl px-2 shadow-floating">
                    {navItems.map((item) => (
                        <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-1 text-center">
                            <item.icon className={cn("h-6 w-6", item.active ? 'text-primary' : 'text-muted-foreground')} />
                            <span className={cn("text-xs", item.active ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>
            </div>
            <style jsx>{`
                .safe-area-pb {
                    padding-bottom: env(safe-area-inset-bottom, 1rem);
                }
            `}</style>
        </footer>
    );
}
