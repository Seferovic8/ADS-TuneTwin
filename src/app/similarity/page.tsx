
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAllTracks, Track } from "@/lib/songs";
import { ListMusic, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function TrackItem({ track }: { track: Track }) {
    return (
        <Link href={`/similarityresults/${track.id}`} className="block">
            <div className="flex items-center p-3 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer">
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
            </div>
        </Link>
    );
}


export default function SimilarityPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [allTracks, setAllTracks] = useState<Track[]>([]);

    useEffect(() => {
        const fetchTracks = async () => {
            const tracks = await getAllTracks();
            setAllTracks(tracks);
        };
        fetchTracks();
    }, []);
    
    const filteredTracks = allTracks.filter(track => 
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Select a Track</h2>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for a track..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-2 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1">
                        {filteredTracks.map((track, index) => (
                            <TrackItem key={`${track.id}-${index}`} track={track} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
