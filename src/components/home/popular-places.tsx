
'use client';

import { SectionHeader } from "@/components/section-header";
import { LocationsRail } from "../locations-rail";

export function PopularPlaces() {
    return (
        <div className="space-y-3 pt-4">
            <SectionHeader title="Popular Places" />
            <LocationsRail />
        </div>
    )
}
