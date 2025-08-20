
import { AppScreens } from "@/components/landing/app-screens";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SpeciesSection } from "@/components/landing/species-section";
import { Testimonials } from "@/components/landing/testimonials";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <AppScreens />
        <Features />
        <SpeciesSection />
        <HowItWorks />
        <TrustStrip />
        <Testimonials />
        <Faq />
        <section className="bg-gradient-to-r from-teal-600 to-blue-700 py-12 md:py-20 text-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Get the Winning Edge
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-lg text-white/90">
              Stop guessing. Start catching. Download AquaCast and get your personalized fishing forecast today.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Button size="lg" variant="default" className="bg-white text-teal-600 hover:bg-white/90">
                Open Web App
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Get the App
              </Button>
            </div>
             <p className="text-xs text-white/80 mt-4">Available on iOS and Android.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
