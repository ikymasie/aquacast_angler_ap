
'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Progress } from "../ui/progress";

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

  return (
    <Card className="rounded-xl shadow-card border-0 p-4 gradient-fishing-panel text-white overflow-hidden">
        <div className="flex justify-between items-center">
            <h2 className="font-headline text-lg font-semibold">Support the Project</h2>
            <Heart className="w-5 h-5 text-white/80" />
        </div>
        
        <div className="mt-4 space-y-2">
            <Progress value={donationData.progressPct} className="h-2 bg-white/30 [&>div]:bg-white" />
            <div className="flex justify-between items-center text-sm">
                <span className="font-bold">{donationData.currency}{donationData.raised}</span>
                <span className="text-white/80">Goal: {donationData.currency}{donationData.goal}</span>
            </div>
             <div className="text-center pt-1">
                <Badge variant="secondary" className="bg-white/20 border-0 text-white mt-1">
                    {donationData.donorCount} donors this month
                </Badge>
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
