// src/app/parks/[slug]/page.tsx (server)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Album from "../components/Album";
import { albumSlugs, getAlbumMeta } from "@/lib/rolls";
import { loadAlbumPhotos } from "../util/util";

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

  if (!meta) return { robots: { index: false, follow: false } };

  return {
    title: meta.title,
    openGraph: { title: meta.title },
    robots: { index: false, follow: false },
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
    notFound();
  }

  const images = await loadAlbumPhotos(meta.slug);

  return <Album meta={meta} images={images} />;
}
