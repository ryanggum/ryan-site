// src/app/parks/[slug]/page.tsx (server)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Album from "../components/Album";
import { albumSlugs, getAlbumMeta } from "@/lib/rolls";
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

  const { default: images } = (await import(
    `@/app/assets/parks/${meta.slug}/photos`
  )) as AlbumModule;

  return <Album meta={meta} images={images} />;
}
