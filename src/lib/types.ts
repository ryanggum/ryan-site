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

export const NullAlbum: AlbumMeta = {
  i: 0,
  date: 0,
  film: { stock: "", iso: 0 },
  slug: "",
  title: "",
  location: [],
  page: false,
};

export type Post = {
  i: number;
  slug: string;
  title: string;
  subtitle?: string;
  date: number;
  description?: string;
};

// Reusable “default export” module helper.
export type ModuleDefault<T> = { default: T };

// Concrete alias used by dynamic imports of photo arrays.
export type AlbumModule = ModuleDefault<Photo[]>;
