"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic } from "lucide-react";

export default function ShazamPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-8">
      <Card className="w-full max-w-md bg-secondary/30">
        <CardContent className="p-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Tap to Shazam</h1>
            <p className="text-muted-foreground mb-8">
                Let's identify that song for you.
            </p>
            <Button
              size="lg"
              className="w-48 h-48 rounded-full bg-primary/20 hover:bg-primary/30 border-8 border-primary/50 text-primary shadow-lg animate-pulse"
            >
              <Mic className="w-24 h-24" />
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
