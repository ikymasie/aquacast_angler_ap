'use client';

import type { DayContext, Window } from "@/lib/types";
import { parseISO, getHours, getMinutes, differenceInMinutes, format, isAfter } from "date-fns";
import { useEffect, useState } from "react";

interface DayArcProps {
    windows: Window[];
    dailyData: DayContext;
}

export function DayArc({ windows, dailyData }: DayArcProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const size = 180; // Reduced size
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    const sunrise = parseISO(dailyData.sunrise);
    const sunset = parseISO(dailyData.sunset);
    
    // Ensure 'now' is within the sunrise/sunset bounds for arc calculation
    const effectiveNow = isAfter(now, sunset) ? sunset : isAfter(sunrise, now) ? sunrise : now;

    const totalDayMinutes = differenceInMinutes(sunset, sunrise);
    const minutesFromSunrise = differenceInMinutes(effectiveNow, sunrise);
    
    // Clamp progress between 0 and 1
    const progress = totalDayMinutes > 0 ? Math.max(0, Math.min(1, minutesFromSunrise / totalDayMinutes)) : 0;
    const sunAngle = -180 + (progress * 180);

    const sunX = center + radius * Math.cos(sunAngle * Math.PI / 180);
    const sunY = center + radius * Math.sin(sunAngle * Math.PI / 180);

    const polarToCartesian = (angle: number) => {
        const angleInRadians = (angle) * Math.PI / 180.0;
        return {
            x: center + (radius * Math.cos(angleInRadians)),
            y: center + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(endAngle);
        const end = polarToCartesian(startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    };

    const getWindowAngle = (time: string) => {
        const date = parseISO(time);
        const minutes = differenceInMinutes(date, sunrise);
        const p = totalDayMinutes > 0 ? Math.max(0, Math.min(1, minutes / totalDayMinutes)) : 0;
        return -180 + (p * 180);
    }
    
    return (
        <div className="relative w-full flex justify-center items-center h-[100px]">
            <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`} className="overflow-visible">
                <defs>
                    <linearGradient id="arc-gradient-bg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FBBF24" />
                        <stop offset="50%" stopColor="#A5D8FF" />
                        <stop offset="100%" stopColor="#FF8C42" />
                    </linearGradient>
                </defs>
                <path
                    d={describeArc(-180, 0)}
                    fill="none"
                    stroke="url(#arc-gradient-bg)"
                    strokeOpacity={0.15}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                
                {/* Highlighted windows */}
                {windows.map((win, i) => (
                    <path
                        key={i}
                        d={describeArc(getWindowAngle(win.startISO), getWindowAngle(win.endISO))}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeOpacity={0.7}
                        strokeWidth={strokeWidth + 2}
                        strokeLinecap="round"
                    />
                ))}

                {/* Sun dot */}
                <circle cx={sunX} cy={sunY} r="8" fill="#FBBF24" stroke="white" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between px-2 text-xs text-white/70">
                <span>{format(sunrise, 'p')}</span>
                <span>{format(sunset, 'p')}</span>
            </div>
        </div>
    );
}
