
import { Badge } from '@/components/ui/badge';
import { Lock, Cloud } from 'lucide-react';

export function TrustStrip() {
  return (
    <div className="py-6 bg-white border-y border-line-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-ink-500">
           <Badge variant="secondary" className="bg-transparent text-ink-500 border-none">
              <Cloud className="w-4 h-4 mr-2"/>
              Powered by Open-Meteo
           </Badge>
            <Badge variant="secondary" className="bg-transparent text-ink-500 border-none">
                <Lock className="w-4 h-4 mr-2"/>
                Your location data is always private
            </Badge>
        </div>
      </div>
    </div>
  );
}
