'use client';

import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();
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
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>
        </div>
      </div>
    </header>
  );
}
