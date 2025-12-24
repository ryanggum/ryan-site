// src/lib/posts.ts
import { Post } from "@/lib/types";

export const posts: Post[] = [
  {
    slug: "oneself",
		num: 1,
    title: "Writing Oneself",
    date: 20250901,
  },
	{
    slug: "walrus",
		num: 2,
    title: "November, or When I Was the Walrus",
		date: 20251101,
  },
	{
    slug: "revolver",
		num: 3,
    title: "Ranking <i>Revolver</i>",
		date: 20251102,
  },
	{
    slug: "island",
		num: 4,
    title: "Hawaii, or The Fate of O...",
		date: 20251201,
  }
];

export const getPostMeta = (slug: string) =>
  posts.find((p) => p.slug === slug);

export const postSlugs = posts.map((p) => ({ slug: p.slug }));
