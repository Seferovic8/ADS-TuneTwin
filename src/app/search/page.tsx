
import { redirect } from 'next/navigation';

export default function SearchPage() {
  // Redirect to the home page as it now serves as the search page
  redirect('/');
}
