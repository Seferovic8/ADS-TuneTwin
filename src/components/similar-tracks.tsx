
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Track } from "@/lib/songs";
import { ChevronDown, Music, Plus } from "lucide-react";
import Image from "next/image";

function TrackItem({ track }: { track: Track }) {
    const matchColor = track.match > 85 ? "text-green-400" : track.match > 75 ? "text-yellow-400" : "text-orange-400";
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
                    <Music className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <div className="flex-1">
                <p className="font-semibold">{track.title}</p>
                <p className="text-sm text-muted-foreground">{track.artist} • {track.album}</p>
            </div>
            <div className={`font-semibold mr-4 ${matchColor}`}>{track.match}% Match</div>
            <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
            </Button>
        </div>
    );
}

export default function SimilarTracks({ tracks }: { tracks: Track[] }) {
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Similar Tracks</h3>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-muted-foreground">
                        Sort by Match
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Match</DropdownMenuItem>
                    <DropdownMenuItem>Artist</DropdownMenuItem>
                    <DropdownMenuItem>Track</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Card className="bg-secondary/30 border-border/50">
            <CardContent className="p-2">
                <div className="space-y-1">
                    {tracks.map(track => (
                        <TrackItem key={track.id} track={track} />
                    ))}
                </div>
            </CardContent>
        </Card>
        <div className="text-center mt-6">
            <Button variant="link" className="text-primary">Show more results</Button>
        </div>
    </div>
  );
}
