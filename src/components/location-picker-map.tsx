
'use client';

import { useEffect, useRef, useState } from 'react';
import L, { type LatLngExpression, type Map as LeafletMap } from 'leaflet';

// Fix for default icon issue with webpack.
// This needs to run only once, and guarded to prevent errors during hot-reloads.
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


export default function LocationPickerMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [center, setCenter] = useState<LatLngExpression>([-24.6545, 25.9086]); // Gaborone

  useEffect(() => {
    // Attempt to get user's location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLatLng: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
          setCenter(userLatLng);
           if (mapRef.current) {
                mapRef.current.setView(userLatLng);
            }
        },
        () => {
          console.log('Could not get user location, using default.');
        }
      );
    }
  }, []);

  useEffect(() => {
    // Initialize map only if container exists and map is not already initialized.
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: center,
        zoom: 13,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Add click listener
      mapRef.current.on('click', (e) => {
          if (!markerRef.current) {
              markerRef.current = L.marker(e.latlng).addTo(mapRef.current!);
              markerRef.current.bindPopup('You selected this spot.').openPopup();
          } else {
              markerRef.current.setLatLng(e.latlng);
          }
           mapRef.current?.flyTo(e.latlng, mapRef.current.getZoom());
      });
    }

    // Cleanup function to run when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.
  
   // Effect to update map center when state changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setView(center, 13, { animate: true });
        }
    }, [center]);


  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
