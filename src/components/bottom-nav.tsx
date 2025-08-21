
'use client'

import { Heart, Map, Search, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

const navItems = [
    { key: 'home', icon: Home, label: 'Home' },
    { key: 'favorites', icon: Heart, label: 'Favorites' },
    { key: 'search', icon: Search, label: 'Search' },
    { key: 'maps', icon: Map, label: 'Maps' },
]

const HomeIconSolid = (props: SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.29,2.89,3.41,8.47a2,2,0,0,0-.82,1.72V20a2,2,0,0,0,2,2H19.41a2,2,0,0,0,2-2V10.19a2,2,0,0,0-.82-1.72l-6.88-5.58a2,2,0,0,0-2.62,0Z" fill="currentColor"/>
    </svg>
);

const HeartIconSolid = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
  </svg>
);

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tabKey: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const activeIndex = navItems.findIndex(item => item.key === activeTab);

    return (
        <footer className="sticky bottom-0 z-50 w-full p-3 bg-transparent">
            <div 
                className="safe-area-pb pointer-events-auto relative mx-auto max-w-[720px] bg-card shadow-floating rounded-t-[20px] h-[64px] flex items-center justify-around"
            >
                
                {activeIndex !== -1 && (
                     <div 
                        className="absolute -top-[10px] h-[12px] w-[24px] bg-primary transition-transform duration-150 ease-out"
                        style={{
                            left: `${(100 / navItems.length) * (activeIndex + 0.5)}%`,
                            transform: 'translateX(-50%)',
                            clipPath: 'path("M0 12C0 12 4.22857 0 12 0C19.7714 0 24 12 24 12H0Z")'
                        }}
                     />
                )}
                
                {navItems.map((item) => {
                    const isActive = item.key === activeTab;
                    
                    let Icon;
                    if (item.key === 'home') {
                      Icon = isActive ? HomeIconSolid : Home;
                    } else if (item.key === 'favorites') {
                      Icon = isActive ? HeartIconSolid : Heart;
                    } else {
                      Icon = item.icon;
                    }
                    
                    return (
                        <button 
                            key={item.key} 
                            onClick={() => onTabChange(item.key)}
                            className="z-10 flex min-w-[72px] flex-col items-center justify-center gap-1 text-center h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-lg" 
                            aria-label={`${item.label} tab`}
                            aria-selected={isActive}
                            role="tab"
                        >
                            <Icon 
                                className={cn(
                                    "h-6 w-6 transition-colors duration-150", 
                                    isActive ? 'text-primary-dark' : 'text-primary-dark/70 group-hover:text-primary-dark/85',
                                )} 
                                strokeWidth={isActive ? (item.key === 'home' || item.key === 'favorites' ? 0 : 2) : 2}
                            />
                            <span className={cn(
                                "text-xs font-medium transition-colors duration-150", 
                                isActive ? 'text-primary-dark' : 'text-muted-foreground group-hover:text-ink-500'
                            )}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </div>
             <style jsx>{`
                .safe-area-pb {
                    padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
                }
            `}</style>
        </footer>
    );
}
