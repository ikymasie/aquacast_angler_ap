
import { Card } from '@/components/ui/card';

const steps = [
  {
    number: '1',
    title: 'Pick a Spot & Species',
    description: 'Search for any lake, river, or spot. Select the species you\'re targeting—like Bass, Bream, or Carp.',
  },
  {
    number: '2',
    title: 'Get Your Score',
    description: 'AquaCast analyzes dozens of real-time weather and environmental factors against our species-specific models.',
  },
  {
    number: '3',
    title: 'Find the Window',
    description: 'Instantly see your Fishing Success Score, a 24-hour forecast graph, and the exact time windows we recommend.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-ink-900">Simple, Fast, and Deadly Accurate</h2>
            <p className="mt-4 text-lg text-ink-500 max-w-2xl mx-auto">Three steps to a better fishing trip.</p>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-line-300 -translate-y-1/2" />
             {steps.map((step, index) => (
                <div key={step.number} className="relative z-10">
                    <Card className="p-6 text-center h-full">
                       <div className="flex justify-center mb-4">
                         <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-lg">
                           {step.number}
                         </div>
                       </div>
                       <h3 className="font-headline text-xl font-semibold text-ink-900 mb-2">{step.title}</h3>
                       <p className="text-ink-500">{step.description}</p>
                    </Card>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
