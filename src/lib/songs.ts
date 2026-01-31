
import { API_BASE_URL } from "./config";

export type ApiTrack = {
    id: number;
    song_id?: number;
    title: string;
    artist: string;
    album: string;
    duration_s: number;
    imagePath: string;
    duration?: number;
    image?: string;
    match?: number;
};

export type Track = {
    id: number;
    title: string;
    artist: string;
    album: string;
    year?: string;
    imageUrl: string;
    imageHint?: string;
    match: number;
};

export type NewSong = {
    title: string;
    artist: string;
    album: string;
    image?: string;
    track: string; // Base64 encoded audio
}

export type RadarPoint = {
    song_id: number;
    x: number;
    y: number;
};

export async function getRadarData(): Promise<RadarPoint[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/getRadar`, {
            headers: {
                "ngrok-skip-browser-warning": "1",
            }
        });
        if (!response.ok) {
            console.error("Failed to fetch radar data:", response.statusText);
            return [];
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching radar data:", error);
        return [];
    }
}

export function mapApiTrackToTrack(apiTrack: ApiTrack): Track {
    let image = `https://img.youtube.com/vi/${apiTrack.image}/mqdefault.jpg`
    if (apiTrack.image == '') {
        image = 'https://picsum.photos/seed/picsum/64/64'; // Default to Rick Astley - Never Gonna Give You Up
    }
    return {
        id: apiTrack.id || apiTrack.song_id || 0,
        title: apiTrack.title,
        artist: apiTrack.artist,
        album: apiTrack.album,
        imageUrl: image,
        match: apiTrack.match || Math.floor(Math.random() * 25) + 75, // Fake a match score
        imageHint: 'album art'
    };
}

// This function now fetches from the API and maps to the existing Track type.
// This minimizes changes needed in the UI components for now.
export async function getAllTracks(): Promise<Track[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllTracks`, {
            headers: {
                "ngrok-skip-browser-warning": "1",
            }
        });
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

export async function findSimilarTracks(song_id: number): Promise<Track[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/findSimilarSongs`, {
            method: 'POST',
            headers: {
                "ngrok-skip-browser-warning": "1",

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
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "1" },
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

export async function addSong(song: NewSong): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/addSong`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "1" },
            body: JSON.stringify(song)
        });

        return response.ok;
    } catch (error) {
        console.error("Error adding song:", error);
        return false;
    }
}


export const similarTracks: Track[] = [
    {
        id: 1,
        title: 'Oblivion',
        artist: 'Grimes',
        album: 'Visions',
        imageUrl: 'https://picsum.photos/seed/oblivion/64/64',
        imageHint: 'abstract portrait',
        match: 89,
    },
    {
        id: 2,
        title: 'Sleepyhead',
        artist: 'Passion Pit',
        album: 'Chunk of Change',
        imageUrl: 'https://picsum.photos/seed/sleepyhead/64/64',
        imageHint: 'dreamy landscape',
        match: 84,
    },
    {
        id: 3,
        title: 'Walking On A Dream',
        artist: 'Empire of the Sun',
        album: 'Walking on a Dream',
        imageUrl: 'https://picsum.photos/seed/empire/64/64',
        imageHint: 'surreal landscape',
        match: 82,
    },
    {
        id: 4,
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
        id: 0,
        title: 'Midnight City',
        artist: 'M83',
        album: "Hurry Up, We're Dreaming",
        imageUrl: 'https://picsum.photos/seed/midnight-city/64/64',
        imageHint: 'city night',
        match: 100,
    },
    ...similarTracks
];
