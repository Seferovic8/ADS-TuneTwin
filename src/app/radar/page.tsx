"use client";

import { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTracks, getRadarData, Track } from "@/lib/songs";
import { Loader2 } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Image from "next/image";

type RadarPoint = {
    song_id: number;
    x: number;
    y: number;
};

type RadarTrack = {
  id: number;
  x: number;
  y: number;
  title: string;
  artist: string;
  imageUrl?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 text-sm bg-background border rounded-md shadow-md flex items-center gap-2">
        {data.imageUrl && (
            <Image
                src={data.imageUrl}
                alt={data.title}
                width={40}
                height={40}
                className="rounded-md"
            />
        )}
        <div>
            <p className="font-bold">{data.title}</p>
            <p className="text-muted-foreground">{data.artist}</p>
        </div>
      </div>
    );
  }

  return null;
};


export default function RadarPage() {
  const [radarTracks, setRadarTracks] = useState<RadarTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [radarData, allTracks] = await Promise.all([
          getRadarData(),
          getAllTracks()
        ]);

        if (!radarData || !allTracks) {
            throw new Error("Failed to fetch data");
        }

        const tracksMap = new Map<number, Track>(allTracks.map(track => [track.id, track]));

        const combinedData: RadarTrack[] = radarData.map(point => {
          const trackInfo = tracksMap.get(point.song_id);
          return {
            id: point.song_id,
            x: point.x,
            y: point.y,
            title: trackInfo?.title || "Unknown Title",
            artist: trackInfo?.artist || "Unknown Artist",
            imageUrl: trackInfo?.imageUrl,
          }
        });

        setRadarTracks(combinedData);
      } catch (err) {
        setError("Failed to load song radar. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Radar</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      <Card className="bg-secondary/30">
        <CardHeader>
          <CardTitle>Song Radar</CardTitle>
          <CardDescription>A 2D projection of the song library. Hover over a point to see song details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[60vh] lg:h-[70vh]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-destructive">
                {error}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis type="number" dataKey="x" name="x" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}/>
                  <YAxis type="number" dataKey="y" name="y" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}/>
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="Songs" data={radarTracks} fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
