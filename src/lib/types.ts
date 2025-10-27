// src/lib/types.ts
import type { StaticImageData } from "next/image";

export type Photo = {
  src: StaticImageData;
  alt: string;
  preview?: boolean;
};

export type AlbumMeta = Readonly<{
  slug: string;
  title: string;
}>;

// Reusable “default export” module helper.
export type ModuleDefault<T> = { default: T };

// Concrete alias used by dynamic imports of photo arrays.
export type AlbumModule = ModuleDefault<Photo[]>;
