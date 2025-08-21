
import { cn } from "@/lib/utils";

interface HeroBackgroundProps {
    topCircleColor?: string;
    bottomCircleColor?: string;
    diameter?: number;
}

export function HeroBackground({ 
    topCircleColor = "bg-primary/10",
    bottomCircleColor = "bg-secondary/10",
    diameter = 240
}: HeroBackgroundProps) {
    const style = {
        width: `${diameter}px`,
        height: `${diameter}px`,
    };

    return (
        <>
            <div 
                className={cn(
                    "absolute -top-20 -right-20 rounded-full opacity-30",
                    topCircleColor
                )}
                style={style}
            />
             <div 
                className={cn(
                    "absolute -bottom-20 -left-20 rounded-full opacity-30",
                    bottomCircleColor
                )}
                style={style}
            />
        </>
    );
}
