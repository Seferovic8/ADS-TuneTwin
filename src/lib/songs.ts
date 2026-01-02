
export type Song = {
  id: string;
  title: string;
  artist: string;
  features: number[];
};

export const songs: Song[] = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', features: [0.8, 0.6, 0.9, 0.2, 0.5] },
  { id: '2', title: 'Stairway to Heaven', artist: 'Led Zeppelin', features: [0.7, 0.5, 0.8, 0.3, 0.6] },
  { id: '3', title: 'Hotel California', artist: 'Eagles', features: [0.6, 0.7, 0.7, 0.4, 0.4] },
  { id: '4', title: 'Smells Like Teen Spirit', artist: 'Nirvana', features: [0.9, 0.2, 0.3, 0.8, 0.7] },
  { id: '5', title: 'Like a Rolling Stone', artist: 'Bob Dylan', features: [0.5, 0.8, 0.6, 0.1, 0.3] },
  { id: '6', title: 'Billie Jean', artist: 'Michael Jackson', features: [0.4, 0.9, 0.5, 0.6, 0.8] },
  { id: '7', title: 'Imagine', artist: 'John Lennon', features: [0.3, 0.4, 0.9, 0.1, 0.2] },
  { id: '8', title: 'One', artist: 'U2', features: [0.7, 0.6, 0.8, 0.3, 0.5] },
  { id: '9', title: 'Shape of You', artist: 'Ed Sheeran', features: [0.3, 0.8, 0.4, 0.7, 0.9] },
  { id: '10', title: 'Blinding Lights', artist: 'The Weeknd', features: [0.5, 0.9, 0.5, 0.8, 0.8] },
];
