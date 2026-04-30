// src/app/parks/[slug]/page.tsx (server)
import Album from "../components/Album";
import { getAlbumMeta } from "@/lib/rolls";
import { NullAlbum } from "@/lib/types";
import type { AlbumModule } from "@/lib/types";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getAlbumMeta(slug);

  if (!meta) {
    return <Album meta={NullAlbum} images={[]} />;
  }

  const { default: images } = (await import(
    `@/app/assets/parks/${meta.slug}/photos`
  )) as AlbumModule;

  return <Album meta={meta} images={images} />;
}
