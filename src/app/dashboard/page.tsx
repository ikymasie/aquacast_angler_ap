
'use client';

import { Header } from '@/components/header';
import { ConditionsPanel } from '@/components/conditions-panel';
import { LocationsRail } from '@/components/locations-rail';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Star, Map, Settings } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';

function GreetingBlock() {
    return (
        <div className="px-4">
             <h1 className="font-headline text-h1 font-bold text-ink-900">Hello John</h1>
             <p className="font-body text-body text-ink-700">It’s a little <span className="text-primary">cloudy</span> today.</p>
             <p className="font-body text-sm text-ink-500 mt-2">Search for the best fishing spots</p>
        </div>
    )
}

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Home' }} isActive>
                <Home />
                <span className="group-data-[collapsible=icon]:hidden">
                  Home
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Favorites' }}>
                <Star />
                <span className="group-data-[collapsible=icon]:hidden">
                  Favorites
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Maps' }}>
                <Map />
                <span className="group-data-[collapsible=icon]:hidden">
                  Maps
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Settings' }}>
                <Settings />
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1">
             <div className="mt-3 space-y-3">
                <GreetingBlock />
                <div className="px-4 mt-3">
                    <SearchBar />
                </div>
             </div>
             <div className="mt-4 px-4">
                <ConditionsPanel />
             </div>
             <div className="mt-5 px-4">
                <SectionHeader title="Locations." />
             </div>
             <div className="mt-3">
                <LocationsRail />
             </div>
          </main>
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
