
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroHeader() {
  const router = useRouter();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AquaCast Acknowledgements',
        text: 'Check out the community behind AquaCast!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <header className="relative h-[180px] w-full overflow-hidden rounded-b-2xl gradient-fishing-panel p-4 flex flex-col justify-between">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 flex justify-between items-center">
         <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
        </Button>
         <Button variant="ghost" size="icon" onClick={handleShare} className="text-white hover:bg-white/10">
            <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative z-10 text-white">
        <h1 className="font-headline text-3xl font-bold">Acknowledgements</h1>
        <p className="text-white/80">Built by the community, for the community.</p>
      </div>
    </header>
  );
}
