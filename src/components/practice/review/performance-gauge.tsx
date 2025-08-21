
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const medicalPalette: Record<string, string> = {
  "Prime": "#0FB67F",
  "Very Good": "#26C6DA",
  "Good": "#7BD389",
  "Fair": "#FFD666",
  "Fair-Slow": "#FFB84D",
  "Poor": "#FF7A70",
  "Very Poor": "#E24848",
};

interface PerformanceGaugeProps {
  score: number;
  band: string;
  drillName: string;
}

export function PerformanceGauge({ score, band, drillName }: PerformanceGaugeProps) {
  const size = 260;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  const bandColor = medicalPalette[band] || '#FFD666';

  const dotAngle = -180 + (score / 100) * 180;
  const dotX = size / 2 + radius * Math.cos(dotAngle * Math.PI / 180);
  const dotY = size / 2 + radius * Math.sin(dotAngle * Math.PI / 180);

  const arcGradient = useMemo(() => {
    return (
      <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={medicalPalette['Very Poor']} />
        <stop offset="25%" stopColor={medicalPalette['Poor']} />
        <stop offset="50%" stopColor={medicalPalette['Fair']} />
        <stop offset="75%" stopColor={medicalPalette['Good']} />
        <stop offset="100%" stopColor={medicalPalette['Prime']} />
      </linearGradient>
    );
  }, []);


  return (
    <Card className="rounded-xl p-4 overflow-hidden shadow-card border-0 bg-panel text-white">
      <div className="text-center mb-4">
        <h2 className="font-headline text-2xl font-bold">{drillName}</h2>
        <p className="text-white/70 text-sm">Session Complete</p>
      </div>
      <div className="relative w-full flex justify-center items-center h-[140px]">
        <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`} className="overflow-visible">
          <defs>{arcGradient}</defs>
          <motion.path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke="url(#arc-gradient)"
            strokeOpacity={0.2}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <motion.path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke="url(#arc-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score / 100 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
           <motion.g
            initial={{ rotate: -180 }}
            animate={{ rotate: dotAngle }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            style={{ transformOrigin: "center center" }}
          >
            <circle cx={size / 2 + radius} cy={size / 2} r="10" fill={bandColor} stroke="white" strokeWidth="2" />
          </motion.g>
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] text-center">
            <motion.div 
                className="font-headline font-bold text-5xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                {score}
                <span className="text-2xl text-white/60">/100</span>
            </motion.div>
             <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
             >
                <Badge style={{ backgroundColor: `${bandColor}2D`, color: bandColor }} className="border-transparent mt-2">
                    {band}
                </Badge>
            </motion.div>
        </div>
      </div>
    </Card>
  );
}
