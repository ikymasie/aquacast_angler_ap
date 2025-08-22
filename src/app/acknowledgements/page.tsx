
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
    currency: "USD",
    donorCount: 42,
    progressPct: 41
  },
  people: [
    { name: "Bob \"Crackberry\" Hirschfeld", blurb: "A true champion of Botswana’s growing fishing community. Your constant source of stoke and encyclopedic knowledge has been a driving force behind this project." },
    { name: "Henry \"AK\" Segopa", blurb: "Thank you for being a mentor and advocate who keeps our collective love for angling thriving through your tireless community efforts and guidance." },
    { name: "Fishing Fanatics Botswana", blurb: "To the entire WhatsApp group—thank you for being a constant source of local knowledge, great community humor, and for being all-around standup guys. We're proud to be a part of it." }
  ],
  about: {
    author: "Ikageng \"Iky\" Masie",
    company: "Digital Landscape (Pty) Ltd",
    mission: "Species-aware forecasts and practice drills for bream, bass & carp."
  }
};

export default function AcknowledgementsPage() {
  const [donationAmount, setDonationAmount] = useState(10);
  const [donationType, setDonationType] = useState<'one_time' | 'monthly'>('one_time');
  
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
