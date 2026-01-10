
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, Upload } from "lucide-react";

export default function ShazamPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center gap-12">
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
        
        <div className="text-center">
            <p className="text-muted-foreground text-lg">or</p>
        </div>

        <Card className="w-full max-w-md bg-secondary/30 border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-3">
                    <Upload className="text-primary"/>
                    Upload a Track
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4 text-center">
                    Have an audio file? Upload it here to find similar songs.
                </p>
                <div className="flex gap-3">
                    <Input type="file" className="flex-1" />
                    <Button>Analyze</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
