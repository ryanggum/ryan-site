// utils

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

export function getMonthNameFromDate(date: number) {
	const monthIndex = (date % 100) - 1; // YYYYMM → MM → 0-based
	return MONTHS[monthIndex];
}

import type { AlbumMeta, AlbumModule } from "@/lib/types";
import type { StaticImageData } from "next/image";

export function groupAlbumsByYear(albums: readonly AlbumMeta[]) {
	const map = new Map<number, AlbumMeta[]>();

	for (const album of albums) {
		const year = Math.floor(album.date / 100);

		if (!map.has(year)) {
			map.set(year, []);
		}

		map.get(year)!.push(album);
	}

	// Sort albums within each year by date desc
	for (const [, yearAlbums] of map) {
		yearAlbums.sort((a, b) => b.date - a.date);
	}

	// Sort years desc
	return Array.from(map.entries()).sort(
		([yearA], [yearB]) => yearB - yearA
	);
}

export type AlbumWithImages = AlbumMeta & {
	images: StaticImageData[];
	imageCount: number;
};

export async function hydrateAlbumsWithImages(
	albumsByYear: [number, AlbumMeta[]][]
): Promise<{ year: number; albums: AlbumWithImages[] }[]> {
	return Promise.all(
		albumsByYear.map(async ([year, yearAlbums]) => {
			const albums = await Promise.all(
				yearAlbums.map(async (album) => {
					const mod = (await import(
						`@/app/assets/parks/${album.slug}/photos`
					)) as AlbumModule;

					const allPhotos = mod.default;
					const images = allPhotos
						.filter((photo) => photo.preview)
						.map((photo) => photo.src);

					return {
						...album,
						images,
						imageCount: allPhotos.length,
					};
				})
			);

			return { year, albums };
		})
	);
}
