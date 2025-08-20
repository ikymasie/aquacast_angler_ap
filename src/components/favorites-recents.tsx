import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Star } from "lucide-react";

const favorites = [
  { name: "Willow Creek Reservoir", photo: "https://placehold.co/160x96.png", hint: "lake sunset" },
  { name: "Tanglewood Lake", photo: "https://placehold.co/160x96.png", hint: "river forest" },
  { name: "Riverbend Park", photo: "https://placehold.co/160x96.png", hint: "creek rocks" },
];

const recents = [
    { name: "Lake Harmony, PA", photo: "https://placehold.co/160x96.png", hint: "mountain lake" },
    { name: "Sunset Marina", photo: "https://placehold.co/160x96.png", hint: "marina boats" },
];


export function FavoritesRecents() {
  return (
    <Card className="h-full flex flex-col rounded-xl">
      <CardHeader>
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recents">Recents</TabsTrigger>
          </TabsList>
          <TabsContent value="favorites" className="mt-4">
            <SpotList spots={favorites} />
          </TabsContent>
          <TabsContent value="recents" className="mt-4">
            <SpotList spots={recents} />
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}

function SpotList({ spots }: { spots: { name: string, photo: string, hint: string }[] }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {spots.map((spot) => (
                <div key={spot.name} className="relative rounded-lg overflow-hidden aspect-[16/10] group cursor-pointer">
                    <Image src={spot.photo} layout="fill" objectFit="cover" alt={spot.name} data-ai-hint={spot.hint} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-2">
                        <p className="text-white font-semibold text-sm drop-shadow-md">{spot.name}</p>
                    </div>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star className="w-5 h-5 text-white fill-amber-400"/>
                    </div>
                </div>
            ))}
        </div>
    )
}
