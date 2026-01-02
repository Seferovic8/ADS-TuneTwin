
export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  imageHint?: string;
  match: number;
};

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
    imageUrl: '',
    match: 82,
  },
    {
    id: '4',
    title: 'Kids',
    artist: 'MGMT',
    album: 'Oracular Spectacular',
    imageUrl: '',
    match: 79,
  },
];
