
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the first track page as a default
  redirect('/tracks/midnight-city');
}
