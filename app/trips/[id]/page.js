import { redirect } from 'next/navigation';

// Navigating to /trips/[id] directly redirects to the builder
export default async function TripRootPage({ params }) {
  const { id } = await params;
  redirect(`/trips/${id}/builder`);
}
