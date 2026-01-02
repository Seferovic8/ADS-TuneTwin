
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { songs } from "@/lib/songs";
import { Loader2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// A simple cosine similarity function for mock calculation
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default function SimilarityCalculator() {
  const [song1Id, setSong1Id] = useState<string | null>(null);
  const [song2Id, setSong2Id] = useState<string | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const song1 = songs.find(s => s.id === song1Id);
  const song2 = songs.find(s => s.id === song2Id);

  useEffect(() => {
    if (similarity !== null) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [similarity]);

  const handleCalculate = () => {
    if (!song1 || !song2) return;

    setIsLoading(true);
    setSimilarity(null);
    setShowResult(false);

    setTimeout(() => {
      const score = cosineSimilarity(song1.features, song2.features);
      setSimilarity(score);
      setIsLoading(false);
    }, 1500); // Simulate network delay
  };

  return (
    <>
      <Card className="w-full shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Select Songs</CardTitle>
          <CardDescription>Choose two songs to compare their similarity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="song1">Song 1</Label>
              <Select onValueChange={setSong1Id} value={song1Id ?? undefined}>
                <SelectTrigger id="song1" className="w-full">
                  <SelectValue placeholder="Select a song" />
                </SelectTrigger>
                <SelectContent>
                  {songs.map((song) => (
                    <SelectItem key={song.id} value={song.id} disabled={song.id === song2Id}>
                      {song.title} - <span className="text-muted-foreground ml-2">{song.artist}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="song2">Song 2</Label>
              <Select onValueChange={setSong2Id} value={song2Id ?? undefined}>
                <SelectTrigger id="song2" className="w-full">
                  <SelectValue placeholder="Select a song" />
                </SelectTrigger>
                <SelectContent>
                  {songs.map((song) => (
                    <SelectItem key={song.id} value={song.id} disabled={song.id === song1Id}>
                      {song.title} - <span className="text-muted-foreground ml-2">{song.artist}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCalculate} disabled={!song1Id || !song2Id || isLoading} className="w-full text-lg py-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                Calculate Similarity <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {showResult && similarity !== null && song1 && song2 && (
        <div className="mt-8 transition-all duration-500 ease-out animate-in fade-in-0 slide-in-from-bottom-5">
          <Card className="w-full shadow-lg border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Similarity Score</CardTitle>
              <CardDescription>
                How similar <span className="font-semibold text-primary">{song1.title}</span> is to <span className="font-semibold text-primary">{song2.title}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/20"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - (similarity ?? 0))}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {Math.round((similarity ?? 0) * 100)}%
                  </span>
                </div>
              </div>
              <Progress value={(similarity ?? 0) * 100} className="w-full h-2 mt-4" />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
