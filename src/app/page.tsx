
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ListMusic, PlayCircle } from "lucide-react";
import Image from 'next/image';
import SimilarTracks from "@/components/similar-tracks";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/search">Search Results</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Midnight City</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 flex flex-col items-center text-center">
          <Card className="w-full max-w-sm bg-secondary/30 p-6 rounded-xl border-border/50">
            <CardContent className="p-0">
              <Image
                src="https://picsum.photos/seed/midnight-city/400/400"
                alt="Album art for Midnight City"
                width={400}
                height={400}
                className="rounded-lg mb-6 aspect-square object-cover"
                data-ai-hint="city night"
              />
              <h2 className="text-3xl font-bold">Midnight City</h2>
              <p className="text-primary text-lg mb-1">M83</p>
              <p className="text-muted-foreground text-sm">Hurry Up, We're Dreaming • 2011</p>
              <div className="flex justify-center gap-2 mt-6">
                <Button size="lg" className="flex-1">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Preview
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <ListMusic className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-w-sm mt-6 bg-secondary/30 rounded-xl border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">MATCH SCORE</p>
                  <p className="text-5xl font-bold text-blue-400">92%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Similar to</p>
                  <p className="text-lg font-semibold text-blue-300">Electronic 2010s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <SimilarTracks />
        </div>
      </div>
    </div>
  );
}
