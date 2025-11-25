// src/lib/posts.ts
import type { StaticImageData } from "next/image";

// Your images
import OneselfImg from "@/app/assets/posts/oneself.jpg"; // <-- example

export type PostMeta = {
  slug: string;
  title: string;
  year: string;
  image?: StaticImageData;   // <-- ADD THIS
};

export const posts: PostMeta[] = [
  {
    slug: "oneself",
    title: "Writing about Oneself",
    year: "2025",
    image: OneselfImg,       // <-- ADD THIS
  },
  // Add more posts here...
];

export const getPostMeta = (slug: string) =>
  posts.find((p) => p.slug === slug);

export const postSlugs = posts.map((p) => ({ slug: p.slug }));
