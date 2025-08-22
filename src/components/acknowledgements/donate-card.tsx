
'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Heart, Loader2 } from "lucide-react";
import { Progress } from "../ui/progress";
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useToast } from "@/hooks/use-toast";

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
}

const presets = [5, 10, 20, 50];

export function DonateCard({
    donationData,
    donationType,
    onDonationTypeChange,
    donationAmount,
    onDonationAmountChange,
}: DonateCardProps) {

  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
      return (
          <Card className="rounded-xl shadow-card border-0 p-4 gradient-fishing-panel text-white">
              <p>PayPal Client ID is not configured. Donations are disabled.</p>
          </Card>
      )
  }

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
            {isProcessing && (
                 <div className="flex items-center justify-center gap-2 text-white/80">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                 </div>
            )}
            <PayPalScriptProvider
                options={{
                    clientId,
                    currency: donationData.currency,
                    intent: 'capture',
                    components: 'buttons',
                }}
            >
                <PayPalButtons
                    fundingSource="paypal"
                    style={{ label: 'donate', layout: 'vertical', shape: 'pill', color: 'white' }}
                    disabled={isProcessing}
                    createOrder={async () => {
                        setMessage(null);
                        setIsProcessing(true);
                        const res = await fetch('/api/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount: donationAmount.toFixed(2), currency: donationData.currency }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                            setIsProcessing(false);
                            toast({ variant: 'destructive', title: 'PayPal Error', description: data?.error || 'Failed to create order.' });
                            throw new Error(data?.error || 'Failed to create order');
                        }
                        return data.id as string;
                    }}
                    onApprove={async (data) => {
                        const res = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID }),
                        });
                        const details = await res.json();
                        setIsProcessing(false);
                        if (!res.ok) {
                            toast({ variant: 'destructive', title: 'Capture Failed', description: details?.error || 'Could not process donation.' });
                            throw new Error(details?.error || 'Capture failed');
                        }
                        toast({ variant: 'success', title: 'Donation Successful!', description: 'Thank you for your generous support!' });
                        // Here you would trigger a refetch of donation data
                    }}
                    onError={(err) => {
                        console.error(err);
                        setIsProcessing(false);
                        toast({ variant: 'destructive', title: 'An Error Occurred', description: 'Please try again.' });
                    }}
                />
            </PayPalScriptProvider>
             <p className="text-xs text-center text-white/70">
                100% of donations fund servers, maintenance, and community features.
            </p>
        </div>
    </Card>
  );
}
