import type { AlbumMeta, AlbumModule, Photo } from "@/lib/types";

/* --------------------------------
   Date helpers
--------------------------------- */

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

/* --------------------------------
   Album grouping
--------------------------------- */

export function groupAlbumsByYear(albums: readonly AlbumMeta[]) {
  const map = new Map<number, AlbumMeta[]>();

  for (const album of albums) {
    const year = Math.floor(album.date / 100);

    if (!map.has(year)) {
      map.set(year, []);
    }

    map.get(year)!.push(album);
  }

  // Sort albums within each year by roll number desc
  for (const [, yearAlbums] of map) {
    yearAlbums.sort((a, b) => b.i - a.i);
  }

  // Sort years desc
  return Array.from(map.entries()).sort(([yearA], [yearB]) => yearB - yearA);
}

/* --------------------------------
   Album hydration
--------------------------------- */

export type AlbumWithImages = AlbumMeta & {
  images: Photo[];
  imageCount: number;
};

function resolvePreviewPhotos(photos: Photo[]) {
  const hasPreview = photos.some((p) => p.preview === true);
  return hasPreview ? photos.filter((p) => p.preview === true) : photos;
}

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

          return {
            ...album,
            images: resolvePreviewPhotos(allPhotos),
            imageCount: allPhotos.length,
          };
        })
      );

      return { year, albums };
    })
  );
}
