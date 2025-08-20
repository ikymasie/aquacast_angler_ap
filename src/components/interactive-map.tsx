
'use client';

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";

interface InteractiveMapProps {
    center: { lat: number; lng: number; };
    zoom?: number;
}

export function InteractiveMap({ center, zoom = 12 }: InteractiveMapProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    });

    const mapOptions = useMemo(() => ({
        mapId: "9b6563cf95e73ca085e3f4d1",
        disableDefaultUI: true,
        gestureHandling: 'cooperative'
    }), []);
    
    const CustomMarker = () => (
        <div className="relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                 <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50% 50% 50% 0',
                    background: '#1C1F28',
                    transform: 'rotate(-45deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                 }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'white',
                        transform: 'rotate(45deg)'
                    }}></div>
                 </div>
            </div>
        </div>
    );

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={zoom}
            options={mapOptions}
        >
            <Marker position={center} icon={{
                 url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path fill="%231C1F28" d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z"/><circle fill="%23FFFFFF" cx="16" cy="16" r="6"/></svg>`,
                 scaledSize: new window.google.maps.Size(32, 42)
            }}/>
        </GoogleMap>
    );
}

