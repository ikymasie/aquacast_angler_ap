
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { SearchBar } from '@/components/search-bar';

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-4 pb-24">
         <SearchBar />
         <div className="flex flex-col items-center justify-center pt-20 text-center">
            <h2 className="text-xl font-semibold text-foreground">Search for a Fishing Spot</h2>
            <p className="text-muted-foreground mt-2">Find lakes, rivers, and dams near you.</p>
         </div>
      </main>
      <BottomNav />
    </div>
  );
}
