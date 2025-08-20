import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, History, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const favorites = [
  { name: "Willow Creek Reservoir", species: "Bass" },
  { name: "Tanglewood Lake", species: "Carp" },
  { name: "Riverbend Park", species: "Bream" },
];

const recents = [
  { name: "Lake Harmony, PA", species: "Bass" },
  { name: "Sunset Marina", species: "Bream" },
];

export function FavoritesRecents() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl">My Spots</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue="favorites" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="favorites"><Star className="w-4 h-4 mr-2" />Favorites</TabsTrigger>
            <TabsTrigger value="recents"><History className="w-4 h-4 mr-2" />Recents</TabsTrigger>
          </TabsList>
          <TabsContent value="favorites" className="flex-1 mt-4">
            <div className="space-y-2">
              {favorites.map((spot, i) => <SpotItem key={i} name={spot.name} species={spot.species} />)}
            </div>
          </TabsContent>
          <TabsContent value="recents" className="flex-1 mt-4">
             <div className="space-y-2">
              {recents.map((spot, i) => <SpotItem key={i} name={spot.name} species={spot.species} />)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SpotItem({ name, species }: { name: string, species: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{species}</p>
      </div>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  )
}