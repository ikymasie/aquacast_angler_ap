import { Search, Locate } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SearchBar() {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for the best fishing spots"
        className="h-12 w-full rounded-md border-input pl-12 pr-12 text-sm"
      />
      <Button
        variant="default"
        size="icon"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary"
      >
        <Locate className="h-5 w-5 text-primary-foreground" />
        <span className="sr-only">Use current location</span>
      </Button>
    </div>
  );
}
