
import { Search, Locate } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SearchBar() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search spots, lakes, rivers..."
          className="h-12 w-full rounded-lg border-line-300 pl-12 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
        />
      </div>
      <Button
        size="icon"
        aria-label="Use current location"
        className="h-11 w-11 rounded-lg bg-teal-100 flex-shrink-0 shadow-card hover:bg-teal-100/90"
      >
        <Locate className="h-5 w-5 text-primary-dark" />
      </Button>
    </div>
  );
}
