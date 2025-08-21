
'use client';

import { MapCard } from '@/components/map-card';
import { PhotoGallery } from '@/components/photo-gallery';

interface GalleryTabProps {
    spot: {
        name: string;
        coordinates: { lat: number; lon: number };
    };
}

export function GalleryTab({ spot }: GalleryTabProps) {
    return (
        <>
            <MapCard
                center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lon }}
            />
            <PhotoGallery spotName={spot.name} />
        </>
    );
}
