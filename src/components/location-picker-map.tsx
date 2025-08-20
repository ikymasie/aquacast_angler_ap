
'use client';

import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useState, useMemo, useCallback } from 'react';
import allSpotsData from "@/lib/locations.json";

interface LocationPickerMapProps {
    onLocationSelect: (location: { lat: number; lng: number; }) => void;
}

export default function LocationPickerMap({ onLocationSelect }: LocationPickerMapProps) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    });

    if (!isLoaded) return <div>Loading...</div>;
    return <Map onLocationSelect={onLocationSelect} />;
}

function Map({ onLocationSelect }: LocationPickerMapProps) {
    const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>(null);

    const center = useMemo(() => ({ lat: -24.6545, lng: 25.9086 }), []); // Gaborone default

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const location = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            setSelected(location);
            onLocationSelect(location);
        }
    }, [onLocationSelect]);
    
    const mapOptions = {
        mapId: "9b6563cf95e73ca085e3f4d1",
        mapTypeControl: false,
        streetViewControl: false,
    };

    return (
        <GoogleMap
            zoom={10}
            center={center}
            mapContainerClassName="w-full h-full"
            options={mapOptions}
            onClick={handleMapClick}
        >
            {selected && <Marker position={selected} />}
        </GoogleMap>
    );
}
