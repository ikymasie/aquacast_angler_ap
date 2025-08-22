
'use client';

import { useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoritesRecents } from "@/components/favorites-recents";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";


export function MyLocations() {
    const [activeTab, setActiveTab] = useState("recents");

    return (
        <div className="space-y-3 pt-4">
            <div>
                <div className="flex justify-between items-center">
                    <SectionHeader title="My Locations" />
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/add-spot">
                            <Plus className="w-5 h-5" />
                        </Link>
                    </Button>
                </div>
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
