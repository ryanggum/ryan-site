import type { AlbumMeta, AlbumModule, Photo } from "@/lib/types";

/* --------------------------------
   Constants
--------------------------------- */

const PREVIEW_COUNT = 3 as const;

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

/* --------------------------------
   Date helpers
--------------------------------- */

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
  return Array.from(map.entries()).sort(([a], [b]) => b - a);
}

/* --------------------------------
   Album hydration
--------------------------------- */

export type AlbumWithImages = AlbumMeta & {
  images: readonly [Photo, Photo, Photo];
  imageCount: number;
};

export type AlbumsByYear = {
  year: number;
  albums: readonly AlbumWithImages[];
};

/**
 * Cache album photo modules for the lifetime of the request
 */
const albumModuleCache = new Map<string, Photo[]>();

function getPreviewPhotos(photos: Photo[]): [Photo, Photo, Photo] {
  const previews = photos.filter((p) => p.preview === true);

  if (previews.length !== PREVIEW_COUNT) {
    throw new Error(
      `Expected exactly ${PREVIEW_COUNT} preview photos, found ${previews.length}`
    );
  }

  return previews as [Photo, Photo, Photo];
}

export async function hydrateAlbumsWithImages(
  albumsByYear: readonly [number, AlbumMeta[]][]
): Promise<AlbumsByYear[]> {
  const results = await Promise.all(
    albumsByYear.map(async ([year, yearAlbums]) => {
      const hydratedAlbums = await Promise.all(
        yearAlbums.map(async (album) => {
          let allPhotos = albumModuleCache.get(album.slug);

          if (!allPhotos) {
            const mod = (await import(
              `@/app/assets/parks/${album.slug}/photos`
            )) as AlbumModule;

            allPhotos = mod.default;
            albumModuleCache.set(album.slug, allPhotos);
          }

          if (process.env.NODE_ENV !== "production") {
            if (!Array.isArray(allPhotos) || allPhotos.length === 0) {
              throw new Error(`Album "${album.slug}" has no photos`);
            }
          }

          return {
            ...album,
            images: getPreviewPhotos(allPhotos),
            imageCount: allPhotos.length,
          };
        })
      );

      // Reinforce deterministic ordering (idempotent safety)
      hydratedAlbums.sort((a, b) => b.i - a.i);

      return {
        year,
        albums: hydratedAlbums,
      };
    })
  );

  return results;
}
