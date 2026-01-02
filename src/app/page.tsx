
import SimilarityCalculator from "@/components/similarity-calculator";
import { Music } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-headline">
              TuneTwin
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Discover the sonic connection between your favorite songs.
          </p>
        </header>
        <SimilarityCalculator />
      </div>
    </main>
  );
}
