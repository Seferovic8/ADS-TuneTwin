"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSong, NewSong } from "@/lib/songs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function AddSongPage() {
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [album, setAlbum] = useState("");
    const [image, setImage] = useState("");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !artist || !album || !audioFile) {
            toast({
                variant: "destructive",
                title: "Missing Fields",
                description: "Please fill out all fields and select an audio file.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioFile);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                const newSong: NewSong = {
                    title,
                    artist,
                    album,
                    image,
                    track: base64Audio,
                };
                
                const success = await addSong(newSong);

                if (success) {
                    toast({
                        title: "Song Added",
                        description: `${title} by ${artist} has been successfully added.`,
                    });
                    // Reset form
                    setTitle("");
                    setArtist("");
                    setAlbum("");
                    setImage("");
                    setAudioFile(null);
                    // This is a bit of a hack to reset the file input visually
                    const fileInput = document.getElementById('audio-file') as HTMLInputElement;
                    if(fileInput) fileInput.value = '';
                } else {
                    toast({
                        variant: "destructive",
                        title: "Submission Failed",
                        description: "Could not add the song. Please try again.",
                    });
                }
                setIsSubmitting(false);
            };
            reader.onerror = () => {
                 toast({
                    variant: "destructive",
                    title: "File Error",
                    description: "There was an error reading the audio file.",
                });
                setIsSubmitting(false);
            }

        } catch (error) {
            console.error("Error submitting song:", error);
            toast({
                variant: "destructive",
                title: "Submission Error",
                description: "An unexpected error occurred.",
            });
            setIsSubmitting(false);
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
             <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Add Song</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-center">
                <Card className="w-full max-w-2xl bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                            <Upload className="text-primary"/>
                            Add a New Song
                        </CardTitle>
                        <CardDescription>
                            Upload a track and provide its details to add it to the library.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" placeholder="Song Title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="artist">Artist</Label>
                                    <Input id="artist" placeholder="Artist Name" value={artist} onChange={(e) => setArtist(e.target.value)} disabled={isSubmitting} required/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="album">Album</Label>
                                <Input id="album" placeholder="Album Name" value={album} onChange={(e) => setAlbum(e.target.value)} disabled={isSubmitting} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Image URL</Label>
                                <Input id="image" placeholder="https://example.com/image.jpg" value={image} onChange={(e) => setImage(e.target.value)} disabled={isSubmitting}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="audio-file">Audio Track</Label>
                                <Input id="audio-file" type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} disabled={isSubmitting} required/>
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin"/>
                                        Adding Song...
                                    </>
                                ) : "Add Song"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}