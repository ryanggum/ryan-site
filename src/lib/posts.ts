// src/lib/posts.ts
import type { StaticImageData } from "next/image";

// Your images
import OneselfImg from "@/app/assets/posts/oneself.jpg"; 

export type PostMeta = {
  slug: string;
  title: string;
	subtitle?: string;
	visible: boolean;
  year?: string;
  image?: StaticImageData;   // <-- ADD THIS
};

export const posts: PostMeta[] = [
  {
    slug: "oneself",
    title: "Writing Oneself",
		visible: true,
    year: "2025",
    image: OneselfImg, 
  },
	  {
    slug: "sgtpepper",
		subtitle: "November 2025",
    title: "When I Was The Walrus",
		visible: false,
  }
];

export const getPostMeta = (slug: string) =>
  posts.find((p) => p.slug === slug);

export const postSlugs = posts.map((p) => ({ slug: p.slug }));
