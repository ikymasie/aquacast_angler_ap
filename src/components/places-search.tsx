'use client';

import { useState, useMemo, useRef, useCallback, useEffect, useTransition } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Search, MapPin, Loader2, X, LocateFixed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const LIBRARIES = ['places'];

interface Spot {
  lat: number;
  lng: number;
  name: string;
  address: string;
  placeId: string;
}

export function PlacesSearch() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES as any,
  });

  if (loadError) return <div className="text-destructive">Error loading maps services.</div>;
  if (!isLoaded) return <Skeleton className="h-[52px] w-full rounded-full" />;

  return <ReadyPlacesSearch />;
}


function ReadyPlacesSearch() {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'bw' }, // Botswana
    },
    debounce: 300,
  });

  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isGpsLoading, startGpsTransition] = useTransition();

  const handleSelect = async (address: string, placeId: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      // Navigate to spot details page with the selected location
      router.push(`/spot-details?name=${encodeURIComponent(address)}`);

    } catch (error) {
      console.error("Error getting coordinates:", error);
       toast({
        variant: 'destructive',
        title: 'Could not get location',
        description: 'There was an error fetching the details for the selected place.',
      });
    }
  };

  const handleGpsClick = () => {
    startGpsTransition(() => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'GPS Not Supported', description: 'Your browser does not support geolocation.'});
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // For this implementation, we will center the map on the user's location
                // by redirecting to a location-aware page or by updating a map context.
                // As a simple navigation, let's go to the add spot page centered on the user.
                 router.push(`/add-spot?lat=${latitude}&lng=${longitude}`);
                 toast({ variant: 'success', title: 'Location Found!', description: 'Centering map on your position.'});
            },
            (error) => {
                let description = 'An unknown error occurred.';
                if (error.code === error.PERMISSION_DENIED) {
                    description = 'Please enable location permissions in your browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    description = 'Your location could not be determined.';
                }
                toast({ variant: 'destructive', title: 'GPS Error', description });
            }
        );
    });
  }

  return (
    <div className="flex items-center gap-3">
        <div className="relative w-full" ref={ref}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder="Search spots, lakes, rivers..."
                className="h-[52px] w-full rounded-[18px] border-line-200 pl-12 pr-10 text-base shadow-[0_2px_8px_rgba(16,24,40,0.06)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                autoComplete="off"
            />
            {value && (
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setValue('')}>
                    <X className="w-4 h-4 text-muted-foreground" />
                </Button>
            )}

            {status === 'OK' && (
                <div className="absolute top-full mt-2 w-full rounded-[14px] bg-white shadow-floating border border-line-200 z-10 overflow-hidden">
                    <ul className="py-1">
                        {data.map(({ place_id, description, structured_formatting }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description, place_id)}
                            className="px-4 py-3 cursor-pointer hover:bg-teal-100/50"
                        >
                            <p className="font-semibold text-sm">
                            {structured_formatting.main_text_matched_substrings.map((match, i) => (
                                <span key={i}>
                                {structured_formatting.main_text.substring(i === 0 ? 0 : structured_formatting.main_text_matched_substrings[i-1].offset + structured_formatting.main_text_matched_substrings[i-1].length, match.offset)}
                                <span className="text-primary-dark">{structured_formatting.main_text.substring(match.offset, match.offset + match.length)}</span>
                                </span>
                            ))}
                            {structured_formatting.main_text.substring(structured_formatting.main_text_matched_substrings[structured_formatting.main_text_matched_substrings.length-1].offset + structured_formatting.main_text_matched_substrings[structured_formatting.main_text_matched_substrings.length-1].length)}
                            </p>
                            <p className="text-xs text-muted-foreground">{structured_formatting.secondary_text}</p>
                        </li>
                        ))}
                    </ul>
                    <div className="px-4 py-1.5 bg-secondary/50 text-right text-xs text-muted-foreground">
                        Powered by Google
                    </div>
                </div>
            )}
        </div>
         <Button
            size="icon"
            aria-label="Use current location"
            className="h-[44px] w-[44px] rounded-[16px] bg-teal-100 flex-shrink-0 shadow-[0_6px_18px_rgba(28,31,40,0.10)] hover:bg-teal-100/90 active:bg-teal-200/80"
            onClick={handleGpsClick}
            disabled={isGpsLoading}
        >
            {isGpsLoading ? <Loader2 className="h-5 w-5 text-primary-dark animate-spin" /> : <LocateFixed className="h-5 w-5 text-primary-dark" />}
        </Button>
    </div>
  );
}
