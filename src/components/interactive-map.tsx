import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Plus, LocateFixed } from "lucide-react";
import { Badge } from "./ui/badge";

export function InteractiveMap() {
  return (
    <Card className="overflow-hidden h-full flex flex-col rounded-xl">
      <CardContent className="p-0 flex-1 relative">
        <Image 
          src="https://placehold.co/600x400.png"
          alt="Map of fishing location"
          layout="fill"
          objectFit="cover"
          data-ai-hint="map satellite"
        />
         <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="h-7 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white">Access</Badge>
            <Badge variant="secondary" className="h-7 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white">Ramps</Badge>
            <Badge variant="secondary" className="h-7 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white">Pegs</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Button variant="secondary" size="icon" className="rounded-full h-9 w-9 bg-white/80 backdrop-blur-sm shadow-md hover:bg-white">
            <LocateFixed className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-4 right-4">
            <Button size="lg" className="rounded-full h-14 w-14 p-0 shadow-floating">
                <Plus className="h-6 w-6" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
