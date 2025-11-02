// src/lib/albums.ts
import type { AlbumMeta } from "./types";

export const albums: AlbumMeta[] = [
	{ slug: "joshua_1", title: "Joshua Tree no. 1", desc: "June 2023, Ektar 100" },
  { slug: "yosemite", title: "Yosemite", desc: "August 2023, Portra 160" },
	{ slug: "joshua_2", title: "Joshua Tree no. 2", desc: "January 2024, Gold 200" },
	{ slug: "sequoia", title: "Sequoia", desc: "March 2024, Fujifilm 400" },
	{ slug: "zion", title: "Zion", quote: { text: "All this is the music of waters.", author: "John Wesley Powell" }, desc: "July 2024, Ektachrome 100" },
	{ slug: "teton", title: "Grand Teton & Yellowstone", desc: "May 2025, Ektar 100" },
	{ slug: "redwoods", title: "Redwoods", desc: "May 2025, Ektachrome 100" },
];

export const albumSlugs = albums.map(a => ({ slug: a.slug }));
export const getAlbumMeta = (slug: string) => albums.find(a => a.slug === slug);
