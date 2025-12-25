// src/lib/types.ts
import type { StaticImageData } from "next/image";

export type Post = {
	slug: string;
	num: number;
	title: string;
	subtitle?: string;
	date: number;
}

export type Photo = {
  src: StaticImageData;
  alt: string;
	caption?: string;
	format?: string;
  preview?: boolean;
};

export type Quote = {
	text: string;
	author: string;
}

export type AlbumMeta = Readonly<{
	num: number;
	date: number;
	slug: string;
	film: { stock: string; iso: number };
  title: string;
	desc: string;
	
	quote?: Quote;
	writing?: string;
}>;

// Reusable “default export” module helper.
export type ModuleDefault<T> = { default: T };

// Concrete alias used by dynamic imports of photo arrays.
export type AlbumModule = ModuleDefault<Photo[]>;
