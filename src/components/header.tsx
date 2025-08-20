'use client';

import { AquaCastLogo } from "@/components/aqua-cast-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Map, Menu, Search, Star } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-nav-background text-nav-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <AquaCastLogo className="h-8 w-8 text-primary" />
          <span className="hidden font-headline text-2xl font-bold text-primary-foreground sm:inline-block">
            AquaCast
          </span>
        </Link>
        
        <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search spots, lakes, rivers..." className="pl-10 bg-background/80 text-foreground focus:bg-background" />
            </div>
        </div>

        {isMobile ? <MobileNav /> : <DesktopNav />}
      </div>
    </header>
  );
}

function DesktopNav() {
  return (
    <nav className="flex items-center gap-2 ml-auto">
      <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">Home</Button>
      <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">Favorites</Button>
      <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">Maps</Button>
      <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
      </Button>
    </nav>
  );
}

function MobileNav() {
  return (
    <div className="ml-auto">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-primary-foreground" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-nav-background text-nav-foreground border-r-border w-3/4 pt-12">
          <div className="relative mb-6 px-4">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 bg-background/80 text-foreground focus:bg-background" />
          </div>
          <nav className="flex flex-col gap-2 px-4">
            <Button variant="ghost" className="justify-start gap-2 text-lg text-primary-foreground hover:bg-primary-foreground/10"><Home /> Home</Button>
            <Button variant="ghost" className="justify-start gap-2 text-lg text-primary-foreground hover:bg-primary-foreground/10"><Star /> Favorites</Button>
            <Button variant="ghost" className="justify-start gap-2 text-lg text-primary-foreground hover:bg-primary-foreground/10"><Map /> Maps</Button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
