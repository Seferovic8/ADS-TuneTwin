
import { redirect } from 'next/navigation';

export default function TrackPage({ params }: { params: { id: string } }) {
  // Redirect to the new similarity page
  redirect(`/similarity?trackId=${params.id}`);
}
