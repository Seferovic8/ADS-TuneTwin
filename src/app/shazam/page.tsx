"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Track, getShazamSong, mapApiTrackToTrack } from "@/lib/songs";
import { AudioLines, Loader2, Mic, Music, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { set } from "zod";
export default function ShazamPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [identifiedTrack, setIdentifiedTrack] = useState<Track | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);



  const stopTimeoutRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  // useEffect(() => {
  //   const checkMicPermission = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       // We have permission. We can stop the track immediately.
  //       stream.getTracks().forEach(track => track.stop());
  //       setHasPermission(true);
  //     } catch (err) {
  //       setHasPermission(false);
  //     }
  //   };
  //   checkMicPermission();
  // }, []);

  const handleAudioData = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setIdentifiedTrack(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        const result = await getShazamSong(base64Audio);
        setIsProcessing(false);
        if (result) {
          setIdentifiedTrack(mapApiTrackToTrack(result));
        } else {
          setError("Could not identify the song. Please try again.");
          toast({
            variant: "destructive",
            title: "Recognition Failed",
            description: "We couldn't identify the song from the provided audio.",
          });
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Error",
          description: "There was an error reading the audio file.",
        });
      }
    } catch (err) {
      console.error("Error recognizing song:", err);
      setError("An error occurred during recognition.");
      toast({
        variant: "destructive",
        title: "Recognition Error",
        description: "Something went wrong while trying to identify the song.",
      });
    } finally {
      // setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setIsRecording(true);
      setError(null);
      setIdentifiedTrack(null);
      audioChunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        handleAudioData(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };
      mediaRecorderRef.current.start();

      // Stop recording after 10 seconds
      setTimeout(stopRecording, 30000);
      toast({
        title: "Listening...",
        description: "Recording for 30 seconds.",
      })

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setHasPermission(false);
      setError("Could not access microphone. Please check permissions.");
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please enable microphone permissions in your browser settings.",
      });
    }
  };

  const stopRecording = () => {
    // clear pending autostop
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    const mr = mediaRecorderRef.current;

    // stop only if actually recording (ignore React state)
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }

    setIsRecording(false);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAudioData(file);
    }
  };

  const resetState = () => {
    setIdentifiedTrack(null);
    setError(null);
    setIsProcessing(false);
    setIsRecording(false);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center gap-8">

        {isProcessing && (
          <Card className="w-full max-w-md bg-secondary/30">
            <CardContent className="p-8 text-center min-h-[380px] flex flex-col items-center justify-center">
              <Loader2 className="w-24 h-24 text-primary animate-spin mb-6" />
              <h1 className="text-2xl font-bold">Identifying...</h1>
              <p className="text-muted-foreground mt-2">Please wait while we analyze the audio.</p>
            </CardContent>
          </Card>
        )}

        {error && !isProcessing && (
          <Card className="w-full max-w-md bg-secondary/30">
            <CardContent className="p-8 text-center min-h-[380px] flex flex-col items-center justify-center">
              <Alert variant="destructive" className="text-left mb-6">
                <AlertTitle>Recognition Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={resetState}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {identifiedTrack && !isProcessing && (
          <Card className="w-full max-w-md bg-secondary/30">
            <CardContent className="p-8 text-center min-h-[380px] flex flex-col items-center justify-center">
              <>
                <h3 className="text-lg font-semibold text-primary mb-4">We found a match!</h3>
                <div className="flex items-center w-full p-3 rounded-lg bg-secondary/30">
                  <Image
                    src={identifiedTrack.imageUrl || ''}
                    alt={`Album art for ${identifiedTrack.title}`}
                    width={64}
                    height={64}
                    className="rounded-md mr-4 aspect-square object-cover"
                    data-ai-hint={identifiedTrack.imageHint}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">{identifiedTrack.title}</p>
                    <p className="text-md text-muted-foreground">{identifiedTrack.artist}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-6 w-full">
                  <Button onClick={resetState} variant="outline" className="flex-1">
                    <X className="mr-2" />
                    Reset
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href={`/similarityresults?trackId=${identifiedTrack.id}`}>
                      <Music className="mr-2" />
                      Find Similar
                    </Link>
                  </Button>
                </div>
              </>
            </CardContent>
          </Card>
        )}

        {!isProcessing && !identifiedTrack && !error && (
          <Card className="w-full max-w-md bg-secondary/30">
            <CardContent className="p-12 text-center">
              <h1 className="text-3xl font-bold mb-4">Tap to Shazam</h1>
              <p className="text-muted-foreground mb-8">
                Let's identify that song for you.
              </p>
              <Button
                size="lg"
                className={`w-48 h-48 rounded-full bg-primary/20 hover:bg-primary/30 border-8 border-primary/50 text-primary shadow-lg ${isRecording ? 'animate-pulse' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || hasPermission === false}
              >
                {isRecording ? <AudioLines className="w-24 h-24" /> : <Mic className="w-24 h-24" />}
              </Button>
              {hasPermission === false && (
                <Alert variant="destructive" className="mt-8 text-left">
                  <AlertTitle>Microphone Access Denied</AlertTitle>
                  <AlertDescription>
                    Please enable microphone permissions in your browser settings to use this feature.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}


        <div className="text-center">
          <p className="text-muted-foreground text-lg">or</p>
        </div>

        <Card className="w-full max-w-md bg-secondary/30 border-border/50 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              <Upload className="text-primary" />
              Upload a Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-center">
              Have an audio file? Upload it here to find similar songs.
            </p>
            <div className="flex gap-3">
              <Input type="file" className="flex-1" accept="audio/*" onChange={handleFileUpload} disabled={isProcessing || isRecording} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
