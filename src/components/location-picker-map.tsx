
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// Fix for default icon issue with webpack (guard so it doesn't re-run weirdly during HMR)
if (typeof window !== 'undefined' && (L.Icon.Default.prototype as any)._getIconUrl) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
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

// Recenter *without* recreating the map instance
function Recenter({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center as any, zoom, { animate: false });
  }, [map, center, zoom]);
  return null;
}

export default function LocationPickerMap() {
  const defaultPosition: LatLngExpression = [-24.6545, 25.9086]; // Gaborone
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultPosition);
  const [isMounted, setIsMounted] = useState(false);

  // Create a *stable* key per mount, so dev StrictMode/HMR doesn't reuse the same DOM node with a fresh map.
  const mapKeyRef = useRef<string>(`lp-map-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {
          console.log('Could not get user location, defaulting to Gaborone.');
        }
      );
    }
  }, []);

  if (!isMounted) return null;

  return (
    <MapContainer
      key={mapKeyRef.current}       // <-- ensures a single Leaflet map per mount
      center={mapCenter}
      zoom={13}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={mapCenter} zoom={13} />
      <LocationMarker />
    </MapContainer>
  );
}
