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
    title: "November, or When I Was the Walrus",
    date: 20251101,
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
    title: "Hawaii, or The Fate of O...",
    date: 20251201,
  },
  {
    slug: "death",
    i: 5,
    title: "Death Valley",
    date: 20260101,
  },
];

export const getPostMeta = (slug: string) => posts.find((p) => p.slug === slug);

export const postSlugs = posts.map((p) => ({ slug: p.slug }));
