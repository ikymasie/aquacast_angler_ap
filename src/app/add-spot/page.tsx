
'use client';

import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Save, Loader2, Edit } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { addSpotAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import type { LatLngLiteral } from 'leaflet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/use-user';

export default function AddSpotPage() {
    const { user } = useUser();
    const [selectedLocation, setSelectedLocation] = useState<LatLngLiteral | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [spotName, setSpotName] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const LocationPickerMap = useMemo(() => dynamic(
        () => import('@/components/location-picker-map'),
        { 
            loading: () => <Skeleton className="w-full aspect-video bg-secondary rounded-lg" />,
            ssr: false 
        }
    ), []);

    const handleLocationSelect = (location: { lat: number; lng: number; }) => {
        setSelectedLocation(location);
    };
    
    const handleSaveSpot = () => {
        if (!selectedLocation) {
            toast({
                variant: 'destructive',
                title: 'No Location Selected',
                description: 'Please tap on the map to select a fishing spot.',
            });
            return;
        }
        setIsDialogOpen(true);
    }

    const handleConfirmSave = () => {
         if (!selectedLocation || !user) return;
         
         startTransition(async () => {
            const { data: newSpot, error } = await addSpotAction({
                userId: user.uid,
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                name: spotName
            });

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Failed to Save Spot',
                    description: error,
                });
            } else if (newSpot) {
                toast({
                    variant: 'success',
                    title: 'Spot Added!',
                    description: `${newSpot.name} has been saved to your account.`,
                });
                router.push(`/`);
            }
            setIsDialogOpen(false);
            setSpotName('');
        });
    }


  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-4 pb-24">
          <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
              </Link>
              <Button onClick={handleSaveSpot} disabled={!selectedLocation || isPending}>
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
              <div className="aspect-video w-full bg-secondary rounded-lg overflow-hidden">
                  <LocationPickerMap onLocationSelect={handleLocationSelect} />
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Name Your Spot</AlertDialogTitle>
                  <AlertDialogDescription>
                      Give your new fishing spot a memorable name. You can change this later.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-2 py-2">
                  <Label htmlFor="spot-name">Spot Name</Label>
                  <Input 
                      id="spot-name" 
                      value={spotName}
                      onChange={(e) => setSpotName(e.target.value)}
                      placeholder="e.g., Secret Bass Cove"
                  />
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmSave} disabled={isPending || !spotName}>
                      {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
