// src/app/parks/[slug]/page.tsx
import ParkAlbumPage from "../components/ParkAlbumPage";

export default async function ParkSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ParkAlbumPage album={slug} />;
}
