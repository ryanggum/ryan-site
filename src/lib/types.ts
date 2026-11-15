// src/lib/types.ts
import type { StaticImageData } from "next/image";

export type Photo = {
  src: StaticImageData;
  alt: string;
  caption?: string;
  preview?: boolean;
};

export type AlbumMeta = Readonly<{
  i: number;
  date: number;
  film: { stock: string; iso: number } | null;
  slug: string;
  title: string;
  location: string[];
  page: boolean;
}>;

export type Post = {
  i: number;
  slug: string;
  title: string;
  subtitle?: string;
  date: number;
  description?: string;
};

// A CSS aspect ratio as width/height, e.g. "3/2" or "4/3".
export type AspectRatio = `${number}/${number}`;

// Reusable “default export” module helper.
export type ModuleDefault<T> = { default: T };

// Concrete alias used by dynamic imports of photo arrays.
export type AlbumModule = ModuleDefault<Photo[]>;
