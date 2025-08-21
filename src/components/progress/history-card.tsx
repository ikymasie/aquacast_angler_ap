
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Share2 } from 'lucide-react';

export function HistoryCard() {
  return (
    <Card className="rounded-xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="secondary" size="lg">
          <History className="w-4 h-4 mr-2" />
          View Full History
        </Button>
        <Button variant="secondary" size="lg">
          <Share2 className="w-4 h-4 mr-2" />
          Share Progress
        </Button>
      </div>
    </Card>
  );
}
