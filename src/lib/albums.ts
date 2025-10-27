// src/lib/albums.ts
import type { AlbumMeta } from "./types";

export const albums: AlbumMeta[] = [
	{ slug: "joshua_1", title: "joshua tree 1" },
  { slug: "yosemite", title: "yosemite" },
	{ slug: "joshua_2", title: "joshua tree 2" },
	{ slug: "sequoia", title: "sequoia" },
	{ slug: "zion", title: "zion" },
	{ slug: "teton", title: "grand teton & yellowstone" },
	{ slug: "redwoods", title: "redwoods" },
];

export const albumSlugs = albums.map(a => ({ slug: a.slug }));
export const getAlbumMeta = (slug: string) => albums.find(a => a.slug === slug);
