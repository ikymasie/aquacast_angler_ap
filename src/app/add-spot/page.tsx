
'use client';

import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddSpotPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-4 pb-24">
        <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Link>
            <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Spot
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-h2 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary"/>
                Add a New Fishing Spot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use the map to find and select your fishing spot. Pan and zoom to find the exact location, then tap to place a pin.
            </p>
            <div className="aspect-video w-full bg-secondary rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Map Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
