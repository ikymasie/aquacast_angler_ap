
'use client'

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Heart, Map, Search } from "lucide-react";
import Link from "next/link";
import type { SVGProps } from "react";

const HomeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M10.29,2.89,3.41,8.47a2,2,0,0,0-.82,1.72V20a2,2,0,0,0,2,2H19.41a2,2,0,0,0,2-2V10.19a2,2,0,0,0-.82-1.72l-6.88-5.58a2,2,0,0,0-2.62,0Z" fill="currentColor"/>
  </svg>
);


const navItems = [
    { href: '#', icon: HomeIcon, label: 'Home', active: true },
    { href: '#', icon: Heart, label: 'Favorites' },
    { href: '#', icon: Search, label: 'Search' },
    { href: '#', icon: Map, label: 'Maps' },
]

export function BottomNav() {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return null;
    }
    
    const activeIndex = navItems.findIndex(item => item.active);

    return (
        <footer className="sticky bottom-0 z-50 w-full p-3 bg-transparent">
            <div className="safe-area-pb pointer-events-auto relative bg-card shadow-floating rounded-xl h-[68px] flex items-center justify-around">
                
                {activeIndex !== -1 && (
                     <div 
                        className="absolute -top-2 transition-all duration-300"
                        style={{
                            left: `${(100 / navItems.length) * (activeIndex + 0.5)}%`,
                            transform: 'translateX(-50%)'
                        }}
                     >
                        <div className="w-8 h-3 bg-primary rounded-b-lg" />
                    </div>
                )}
                

                {navItems.map((item, index) => (
                    <Link key={item.label} href={item.href} className="z-10 flex min-w-[56px] flex-col items-center justify-center gap-1 text-center" aria-label={item.label}>
                        <item.icon className={cn("h-6 w-6", item.active ? 'text-primary' : 'text-muted-foreground/70')} strokeWidth={item.active ? '0' : '2'} />
                        <span className={cn("text-xs font-medium", item.active ? 'text-primary-dark' : 'text-muted-foreground')}>
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
