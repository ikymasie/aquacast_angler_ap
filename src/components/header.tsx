'use client';

import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();
  const hasNotifications = true; // Set this based on actual notification state

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
       <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
        {isMobile ? (
           <SidebarTrigger asChild>
             <Button variant="ghost" size="icon" className="h-10 w-10">
               <Menu className="h-5 w-5" />
             </Button>
           </SidebarTrigger>
        ) : <SidebarTrigger />}
       
        <div className="ml-4">
            <h3 className="font-headline text-h3 font-semibold">Hello, John</h3>
            <p className="text-caption text-muted-foreground">It’s a little cloudy today.</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 bg-teal-100 hover:bg-teal-100/80">
                <Bell className="h-5 w-5 text-teal-600" />
                {hasNotifications && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-alert" />}
                <span className="sr-only">Notifications</span>
            </Button>
        </div>
      </div>
    </header>
  );
}