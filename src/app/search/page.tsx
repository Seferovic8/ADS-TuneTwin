
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { similarTracks, Track } from "@/lib/songs";
import { ListMusic, Mic, Radio, Upload } from "lucide-react";
import Image from "next/image";

function TrackItem({ track }: { track: Track }) {
    return (
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
    );
}


export default function SearchPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Column: Track Selection */}
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold mb-4">Select a Track</h2>
                    <Card className="bg-secondary/30 border-border/50">
                        <CardContent className="p-2 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-1">
                                {[...similarTracks, ...similarTracks, ...similarTracks].map((track, index) => (
                                    <TrackItem key={`${track.id}-${index}`} track={track} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Find Similarity */}
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold mb-4">Find Your Next Jam</h2>
                    <div className="space-y-6">
                        <Card className="bg-secondary/30 border-border/50 hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Upload className="text-primary"/>
                                    Upload a Track
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Have an audio file? Upload it here to find similar songs.
                                </p>
                                <div className="flex gap-3">
                                    <Input type="file" className="flex-1" />
                                    <Button>Analyze</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-secondary/30 border-border/50 hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Radio className="text-primary"/>
                                    Recognize Audio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Playing a song nearby? Let us listen and identify it for you, Shazam-style.
                                </p>
                                <Button size="lg" className="w-full">
                                    <Mic className="mr-2"/>
                                    Start Listening
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-secondary/30 border-border/50 hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Mic className="text-primary"/>
                                    Record a Melody
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                   Hum a tune or record a snippet of audio to find matching tracks.
                                </p>
                                <Button size="lg" variant="outline" className="w-full">
                                    Start Recording
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
