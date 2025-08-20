
import { Card } from '@/components/ui/card';
import { BarChart, CloudOff, Target } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Fishing Success Score',
    description: 'Our core feature. Get a simple 0-100 score telling you how good the fishing is for your target species, right now.',
  },
  {
    icon: BarChart,
    title: '24h/7d Forecast Graphs',
    description: 'Visualize the best times to fish with hourly success graphs and a full 7-day outlook for any spot.',
  },
  {
    icon: CloudOff,
    title: 'Offline Caching',
    description: "No signal? No problem. Key forecasts and maps for your favorite spots are cached for access when you're off-grid.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-ink-900">The Power of Precision</h2>
            <p className="mt-4 text-lg text-ink-500 max-w-2xl mx-auto">AquaCast isn't just another weather app. It's a purpose-built tool for anglers.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-4">
                 <div className="p-3 bg-teal-100 rounded-full">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                 </div>
              </div>
              <h3 className="font-headline text-xl font-semibold text-ink-900 mb-2">{feature.title}</h3>
              <p className="text-ink-500">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
