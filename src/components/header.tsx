
'use client';

import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();
  const hasNotifications = true; // Set this based on actual notification state

  return (
    <header className="sticky top-0 z-30 w-full border-b border-line-200 bg-background/95 backdrop-blur-sm">
       <div className="container mx-auto flex h-14 items-center px-4">
        {isMobile ? (
           <SidebarTrigger asChild>
             <Button variant="ghost" size="icon" className="h-10 w-10">
               <Menu className="h-6 w-6 text-ink-900" />
             </Button>
           </SidebarTrigger>
        ) : <SidebarTrigger />}
       
        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative rounded-lg h-11 w-11 bg-teal-100 hover:bg-teal-100/80 active:bg-teal-100/90 shadow-card" aria-label="Notifications">
                <Bell className="h-5 w-5 text-primary-dark" />
                {hasNotifications && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-alert" />}
            </Button>
        </div>
      </div>
    </header>
  );
}
