
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// Fix for default icon issue with webpack. This needs to run only once.
if (typeof window !== 'undefined') {
    if ((L.Icon.Default.prototype as any)._getIconUrl) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
    }
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}


function LocationMarker() {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You selected this spot.</Popup>
    </Marker>
  );
}


export default function LocationPickerMap() {
  const defaultPosition: LatLngExpression = [-24.6545, 25.9086]; // Gaborone
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultPosition);
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
            const newCenter: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
            setMapCenter(newCenter);
            // Force a re-render with a new key to ensure the map re-initializes cleanly with the new center
            setMapKey(prevKey => prevKey + 1); 
        },
        () => {
          console.log('Could not get user location, defaulting to Gaborone.');
        }
      );
    }
  }, []);

  // Prevent rendering on the server and until the component is mounted
  if (!isMounted) {
    return null;
  }

  return (
    <MapContainer
      key={mapKey} // When this key changes, React will unmount the old and mount a new component
      center={mapCenter}
      zoom={13}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}
