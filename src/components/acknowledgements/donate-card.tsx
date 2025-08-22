
'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface DonateCardProps {
    donationData: {
        raised: number;
        goal: number;
        currency: string;
        donorCount: number;
        progressPct: number;
    },
    donationType: 'one_time' | 'monthly';
    onDonationTypeChange: (type: 'one_time' | 'monthly') => void;
    donationAmount: number;
    onDonationAmountChange: (amount: number) => void;
    onDonate: () => void;
}

const presets = [50, 100, 200, 500];

export function DonateCard({
    donationData,
    donationType,
    onDonationTypeChange,
    donationAmount,
    onDonationAmountChange,
    onDonate
}: DonateCardProps) {
  const size = 260;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  
  const dotAngle = -180 + (donationData.progressPct / 100) * 180;
  
  const arcGradient = useMemo(() => (
    <linearGradient id="donate-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#FFC837" />
      <stop offset="100%" stopColor="#27BFA6" />
    </linearGradient>
  ), []);

  return (
    <Card className="rounded-xl shadow-card border-0 p-4 bg-gradient-to-br from-primary to-primary-dark text-white overflow-hidden">
        <div className="flex justify-between items-center">
            <h2 className="font-headline text-lg font-semibold">Support the Project</h2>
            <Heart className="w-5 h-5 text-white/80" />
        </div>
        
        <div className="relative w-full flex justify-center items-center h-[140px] mt-2">
            <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`} className="overflow-visible">
                <defs>{arcGradient}</defs>
                <motion.path
                    d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
                    fill="none"
                    stroke="url(#donate-arc-gradient)"
                    strokeOpacity={0.2}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                <motion.path
                    d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
                    fill="none"
                    stroke="url(#donate-arc-gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: donationData.progressPct / 100 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <motion.g
                    initial={{ rotate: -180 }}
                    animate={{ rotate: dotAngle }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    style={{ transformOrigin: "center center" }}
                >
                    <circle cx={size / 2 + radius} cy={size / 2} r="10" fill="white" stroke="#27BFA6" strokeWidth="2" />
                </motion.g>
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] text-center">
                <motion.div 
                    className="font-headline font-bold text-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    {donationData.currency}{donationData.raised} / {donationData.currency}{donationData.goal}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                >
                    <Badge variant="secondary" className="bg-white/20 border-0 text-white mt-1">
                        {donationData.donorCount} donors this month
                    </Badge>
                </motion.div>
            </div>
        </div>

        <div className="mt-4 space-y-3">
             <div className="bg-white/10 rounded-lg p-1 grid grid-cols-2">
                <button 
                    onClick={() => onDonationTypeChange('one_time')}
                    className={cn("h-8 rounded-md text-sm font-semibold transition-colors", donationType === 'one_time' && 'bg-white text-primary-dark')}
                >
                    One-time
                </button>
                 <button 
                    onClick={() => onDonationTypeChange('monthly')}
                    className={cn("h-8 rounded-md text-sm font-semibold transition-colors", donationType === 'monthly' && 'bg-white text-primary-dark')}
                >
                    Monthly
                </button>
            </div>
            <div className="flex justify-around items-center">
                {presets.map(p => (
                    <Button 
                        key={p} 
                        variant="ghost" 
                        onClick={() => onDonationAmountChange(p)}
                        className={cn("rounded-lg h-10 w-14 text-white hover:bg-white/20", donationAmount === p && "bg-white/25")}
                    >
                       {p}
                    </Button>
                ))}
                 <Button variant="ghost" className="rounded-lg text-white hover:bg-white/20">
                   Custom
                </Button>
            </div>
            <Button size="xl" className="w-full bg-white text-primary-dark hover:bg-white/90" onClick={onDonate}>
                Donate {donationData.currency}{donationAmount}
            </Button>
             <p className="text-xs text-center text-white/70">
                100% of donations fund servers, maintenance, and community features.
            </p>
        </div>
    </Card>
  );
}
