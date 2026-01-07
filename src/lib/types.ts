// src/lib/types.ts
import type { StaticImageData } from "next/image";

export type Post = {
  i: number;
  slug: string;
  title: string;
  subtitle?: string;
  date: number;
};

export type Photo = {
  src: StaticImageData;
  alt: string;
  caption?: string;
  preview?: boolean;
};

export type AlbumMeta = Readonly<{
  i: number;
  slug: string;
  title: string;
  date: number;
  film: { stock: string; iso: number };
  page: boolean;
}>;

// Reusable “default export” module helper.
export type ModuleDefault<T> = { default: T };

// Concrete alias used by dynamic imports of photo arrays.
export type AlbumModule = ModuleDefault<Photo[]>;
