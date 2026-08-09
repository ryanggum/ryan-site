// src/lib/posts.ts
import { Post } from "@/lib/types";

export const posts: Post[] = [
  {
    slug: "oneself",
    i: 1,
    title: "Writing Oneself",
    date: 20250901,
  },
  {
    slug: "walrus",
    i: 2,
    title: "When I Am the Walrus",
    date: 20251101,
    description: "November 2025",
  },
  {
    slug: "revolver",
    i: 3,
    title: "Ranking <i>Revolver</i>",
    date: 20251102,
  },
  {
    slug: "hawaii",
    i: 4,
    title: "The Fate of O...",
    date: 20251201,
    description: "Trip Report: Hawaii.",
  },
  {
    slug: "jmt",
    i: 5,
    title: "I hiked the John Muir Trail",
    date: 20260301,
  },
];

export const getPostMeta = (slug: string) => posts.find((p) => p.slug === slug);

export const postSlugs = posts.map((p) => ({ slug: p.slug }));

// Post titles may contain inline markup (e.g. "Ranking <i>Revolver</i>") for
// display; metadata fields like <title> need the plain-text version.
export const stripHtml = (input: string) => input.replace(/<[^>]+>/g, "");
