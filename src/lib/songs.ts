
import { API_BASE_URL } from "./config";

export type ApiTrack = {
  id: string;
  song_id?: string;
  title: string;
  artist: string;
  album: string;
  duration_s: number;
  imagePath: string;
  duration?: number;
  image?: string;
};

export type Track = {
  id:string;
  title: string;
  artist: string;
  album: string;
  year?: string;
  imageUrl: string;
  imageHint?: string;
  match: number;
};

export const mapApiTrackToTrack = (apiTrack: ApiTrack): Track => ({
    id: apiTrack.id || apiTrack.song_id || '',
    title: apiTrack.title,
    artist: apiTrack.artist,
    album: apiTrack.album,
    imageUrl: apiTrack.imagePath || apiTrack.image || `https://picsum.photos/seed/${apiTrack.id}/64/64`,
    match: Math.floor(Math.random() * 25) + 75, // Fake a match score
    imageHint: 'album art'
});

// This function now fetches from the API and maps to the existing Track type.
// This minimizes changes needed in the UI components for now.
export async function getAllTracks(): Promise<Track[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllTracks`);
        if (!response.ok) {
            console.error("Failed to fetch tracks:", response.statusText);
            return fallbackTracks;
        }
        const apiTracks: ApiTrack[] = await response.json();
        
        return apiTracks.map(mapApiTrackToTrack);
    } catch (error) {
        console.error("Error fetching tracks:", error);
        return fallbackTracks;
    }
}

export async function findSimilarTracks(song_id: string): Promise<Track[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/findSimilarSongs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ song_id }),
        });

        if (!response.ok) {
            console.error("Failed to fetch similar tracks:", response.statusText);
            return similarTracks; // fallback
        }

        const apiTracks: ApiTrack[] = await response.json();
        return apiTracks.map(mapApiTrackToTrack);

    } catch (error) {
        console.error("Error fetching similar tracks:", error);
        return similarTracks; // fallback
    }
}

export async function getShazamSong(audio: string): Promise<ApiTrack | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/getShazamSong`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio_base64: audio })
        });
        if (!response.ok) {
            console.error("Failed to shazam song:", response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error shazaming song:", error);
        return null;
    }
}


export const similarTracks: Track[] = [
  {
    id: '1',
    title: 'Oblivion',
    artist: 'Grimes',
    album: 'Visions',
    imageUrl: 'https://picsum.photos/seed/oblivion/64/64',
    imageHint: 'abstract portrait',
    match: 89,
  },
  {
    id: '2',
    title: 'Sleepyhead',
    artist: 'Passion Pit',
    album: 'Chunk of Change',
    imageUrl: 'https://picsum.photos/seed/sleepyhead/64/64',
    imageHint: 'dreamy landscape',
    match: 84,
  },
  {
    id: '3',
    title: 'Walking On A Dream',
    artist: 'Empire of the Sun',
    album: 'Walking on a Dream',
    imageUrl: 'https://picsum.photos/seed/empire/64/64',
    imageHint: 'surreal landscape',
    match: 82,
  },
    {
    id: '4',
    title: 'Kids',
    artist: 'MGMT',
    album: 'Oracular Spectacular',
    imageUrl: 'https://picsum.photos/seed/kids/64/64',
    imageHint: 'childlike drawing',
    match: 79,
  },
];

const fallbackTracks: Track[] = [
  {
    id: 'midnight-city',
    title: 'Midnight City',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    imageUrl: 'https://picsum.photos/seed/midnight-city/64/64',
    imageHint: 'city night',
    match: 100,
  },
  ...similarTracks
];
