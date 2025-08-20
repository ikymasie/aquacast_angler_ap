import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, LocateFixed, Download } from "lucide-react";

export function InteractiveMap() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl">Map</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Layers">
            <Layers className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Recenter">
            <LocateFixed className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative">
        <Image 
          src="https://placehold.co/600x400.png"
          alt="Map of fishing location"
          layout="fill"
          objectFit="cover"
          data-ai-hint="map satellite"
        />
        <div className="absolute bottom-2 right-2">
            <Button aria-label="Download offline map">
                <Download className="mr-2 h-4 w-4" />
                Offline
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}