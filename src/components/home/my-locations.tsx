
'use client';

import { useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoritesRecents } from "@/components/favorites-recents";


export function MyLocations() {
    const [activeTab, setActiveTab] = useState("recents");

    return (
        <div className="space-y-3 pt-4">
            <div>
                <SectionHeader title="My Locations" />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                  <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto">
                    <TabsTrigger value="all_spots">All Spots</TabsTrigger>
                    <TabsTrigger value="recents">Recents</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  </TabsList>
                </Tabs>
            </div>
            <div>
                <FavoritesRecents tab={activeTab as any} />
            </div>
        </div>
    )
}
