"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAllTracks, getRecommendations, Track } from "@/lib/songs";
import { Heart, ListMusic, Loader2, Search, Wand2 } from "lucide-react";
import Image from "next/image";
import SimilarTracks from "@/components/similar-tracks";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

function TrackSelectItem({ track, onLike, isLiked }: { track: Track, onLike: (id: number) => void, isLiked: boolean }) {
    return (
        <div className="flex items-center p-3 rounded-lg hover:bg-secondary/20 transition-colors">
            {track.imageUrl ? (
                <Image
                    src={track.imageUrl}
                    alt={`Album art for ${track.title}`}
                    width={48}
                    height={48}
                    className="rounded-md mr-4 aspect-square object-cover"
                    data-ai-hint={track.imageHint}
                />
            ) : (
                <div className="w-12 h-12 flex-shrink-0 mr-4 rounded-md bg-secondary flex items-center justify-center">
                    <ListMusic className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <div className="flex-1">
                <p className="font-semibold">{track.title}</p>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onLike(track.id)}>
                <Heart className={cn("h-5 w-5", isLiked ? "text-red-500 fill-current" : "text-muted-foreground")} />
            </Button>
        </div>
    );
}

export default function RecommendationPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [allTracks, setAllTracks] = useState<Track[]>([]);
    const [likedTrackIds, setLikedTrackIds] = useState<Set<number>>(new Set());
    const [recommendations, setRecommendations] = useState<Track[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTracks = async () => {
            const tracks = await getAllTracks();
            setAllTracks(tracks);
        };
        fetchTracks();
    }, []);

    const handleLikeToggle = (trackId: number) => {
        setLikedTrackIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trackId)) {
                newSet.delete(trackId);
            } else {
                newSet.add(trackId);
            }
            return newSet;
        });
    };

    const handleGetRecommendations = async () => {
        if (likedTrackIds.size === 0) return;
        setIsLoading(true);
        const results = await getRecommendations(Array.from(likedTrackIds));
        setRecommendations(results);
        setIsLoading(false);
    };
    
    const reset = () => {
        setLikedTrackIds(new Set());
        setRecommendations(null);
        setSearchTerm("");
    }

    const filteredTracks = allTracks.filter(track =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
             <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[80vh]">
                <div className="text-center">
                    <Loader2 className="w-24 h-24 text-primary animate-spin mb-6" />
                    <h1 className="text-2xl font-bold">Generating Recommendations...</h1>
                    <p className="text-muted-foreground mt-2">Please wait while we find your next favorite songs.</p>
                </div>
            </div>
        )
    }

    if (recommendations) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <Breadcrumb className="mb-8">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Recommendation</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex justify-end mb-4">
                     <Button onClick={reset}>Start Over</Button>
                </div>
                <SimilarTracks tracks={recommendations} />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Recommendation</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Find Your Vibe</h2>
                <p className="text-muted-foreground mt-2">Like some songs to get personalized recommendations.</p>
            </div>

            <div className="sticky top-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4 mb-4">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for a track..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button 
                    onClick={handleGetRecommendations} 
                    disabled={likedTrackIds.size === 0}
                    className="w-full"
                    size="lg"
                >
                    <Wand2 className="mr-2"/>
                    Recommend ({likedTrackIds.size} liked)
                </Button>
            </div>
           
            <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-2 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-1">
                        {filteredTracks.map((track) => (
                            <TrackSelectItem 
                                key={track.id} 
                                track={track} 
                                onLike={handleLikeToggle}
                                isLiked={likedTrackIds.has(track.id)}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}