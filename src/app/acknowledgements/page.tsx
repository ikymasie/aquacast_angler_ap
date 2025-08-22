
'use client';

import { HeroHeader } from '@/components/acknowledgements/hero-header';
import { AboutCard, SpecialThanksCard, TransparencyCard, CommunityCard } from '@/components/acknowledgements/content-cards';
import { DonateCard } from '@/components/acknowledgements/donate-card';
import { useState } from 'react';
import Link from 'next/link';

// Data can be fetched from an API or defined statically
const pageData = {
  donations: {
    raised: 3250,
    goal: 8000,
    currency: "BWP",
    donorCount: 42,
    progressPct: 41
  },
  people: [
    { name: "Bob \"Crackberry\" Hirschfeld", blurb: "Champion of Botswana’s growing fishing community and constant source of stoke." },
    { name: "Henry \"AK\" Segopa", blurb: "Mentor and advocate who keeps our love for angling thriving." }
  ],
  about: {
    author: "Ikageng \"Iky\" Masie",
    company: "Digital Landscape (Pty) Ltd",
    mission: "Species-aware forecasts and practice drills for bream, bass & carp."
  }
};

export default function AcknowledgementsPage() {
  const [donationAmount, setDonationAmount] = useState(100);
  const [donationType, setDonationType] = useState<'one_time' | 'monthly'>('one_time');

  const handleDonation = () => {
    const payload = {
        type: donationType,
        amount: donationAmount,
        currency: pageData.donations.currency,
        source: 'acknowledgements_page',
        returnUrl: '/acknowledgements?thanks=1'
    };
    // In a real app, this would trigger a checkout flow
    console.log("Donation Payload:", payload);
    alert(`Thank you for your ${donationType} donation of ${payload.currency} ${payload.amount}!`);
  };
  
  return (
    <div className="bg-background min-h-screen">
      <HeroHeader />
      <main className="p-4 space-y-3 pb-24">
        <AboutCard about={pageData.about} />
        <SpecialThanksCard people={pageData.people} />
        <DonateCard 
          donationData={pageData.donations}
          donationType={donationType}
          onDonationTypeChange={setDonationType}
          donationAmount={donationAmount}
          onDonationAmountChange={setDonationAmount}
          onDonate={handleDonation}
        />
        <TransparencyCard />
        <CommunityCard />
      </main>
      <footer className="text-center text-xs text-muted-foreground pb-24 px-4">
        <p>© {new Date().getFullYear()} Digital Landscape (Pty) Ltd · Built with love in Botswana.</p>
        <div className="mt-1">
            <Link href="#" className="underline">Terms</Link> · <Link href="#" className="underline">Privacy</Link> · <Link href="#" className="underline">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
