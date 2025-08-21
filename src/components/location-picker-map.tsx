
'use client';

import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface LocationPickerMapProps {
    onLocationSelect: (location: { lat: number; lng: number; }) => void;
}

export default function LocationPickerMap({ onLocationSelect }: LocationPickerMapProps) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: ['places'],
    });

    if (!isLoaded) return <div>Loading...</div>;
    return <Map onLocationSelect={onLocationSelect} />;
}

function Map({ onLocationSelect }: LocationPickerMapProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isPanning, setIsPanning] = useState(false);

    const center = useMemo(() => ({ lat: -24.6545, lng: 25.9086 }), []); // Gaborone default

    const handleDragStart = useCallback(() => {
        setIsPanning(true);
    }, []);

    const handleIdle = useCallback(() => {
        setIsPanning(false);
        if (map) {
            const center = map.getCenter();
            if (center) {
                onLocationSelect({
                    lat: center.lat(),
                    lng: center.lng(),
                });
            }
        }
    }, [map, onLocationSelect]);

    const mapOptions = {
        mapId: "9b6563cf95e73ca085e3f4d1",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
    };

    return (
        <div className="w-full h-full relative">
            <GoogleMap
                zoom={10}
                center={center}
                mapContainerClassName="w-full h-full"
                options={mapOptions}
                onLoad={setMap}
                onDragStart={handleDragStart}
                onIdle={handleIdle}
            >
                {/* The map children go here, but we have a fixed pin overlay instead */}
            </GoogleMap>
            <div className={cn(
                "absolute left-1/2 top-1/2 pointer-events-none transition-transform duration-150 ease-out",
                 isPanning && "translate-y-[-6px]"
            )}
            style={{
                transform: `translate(-50%, calc(-100% + 8px)) ${isPanning ? 'translateY(-6px)' : ''}`
            }}
            >
                 <MapPin className="h-12 w-12 text-primary drop-shadow-lg" style={{strokeWidth: 1.5}}/>
            </div>
        </div>
    );
}
