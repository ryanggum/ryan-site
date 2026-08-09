// src/app/parks/[slug]/page.tsx (server)
import type { Metadata } from "next";
import Album from "../components/Album";
import { albumSlugs, getAlbumMeta } from "@/lib/rolls";
import { NullAlbum } from "@/lib/types";
import type { AlbumModule } from "@/lib/types";

export function generateStaticParams() {
  return albumSlugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getAlbumMeta(slug);

  if (!meta) return {};

  return {
    title: meta.title,
    openGraph: { title: meta.title },
  };
}

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
