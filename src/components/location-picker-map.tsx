
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// Fix for default icon issue with webpack
// This should be done once, so it's safe outside the component.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


function LocationMarker() {
    const [position, setPosition] = useState<LatLngExpression | null>(null);
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom())
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>You selected this spot.</Popup>
        </Marker>
    );
}

export default function LocationPickerMap() {
    // Default center to Gaborone, Botswana
    const defaultPosition: LatLngExpression = [-24.6545, 25.9086]; 
    const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultPosition);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Center on user's location if available
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setMapCenter([position.coords.latitude, position.coords.longitude]);
            },
            () => {
                console.log("Could not get user location, defaulting to Gaborone.");
            }
        );
    }, []);

    // We need to ensure the map is only rendered on the client after the component has mounted.
    // The error "Map container is already initialized" often happens with React Strict Mode
    // or fast refresh, where the component might re-render without the old map instance being destroyed.
    // By waiting for isMounted, we avoid rendering the map on the server or during initial problematic renders.
    if (!isMounted) {
        return null; // Or a loading skeleton
    }
    
    return (
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
}
