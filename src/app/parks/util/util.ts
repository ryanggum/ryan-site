// src/app/parks/util/util.ts
import type { AlbumMeta, AlbumModule, Photo } from "@/lib/types";
import { groupByYear } from "@/lib/groupByYear";

const PREVIEW_COUNT = 3;

/** Albums bucketed by year (descending), newest roll first within a year. */
export function groupAlbumsByYear(albums: readonly AlbumMeta[]) {
  return groupByYear(
    albums,
    (album) => Math.floor(album.date / 100),
    (a, b) => b.i - a.i,
  );
}

/** An album's full photo list, from `assets/parks/<slug>/photos.ts`. */
export async function loadAlbumPhotos(slug: string): Promise<Photo[]> {
  const mod = (await import(
    `@/app/assets/parks/${slug}/photos`
  )) as AlbumModule;
  return mod.default;
}

/**
 * Attach each album's preview photos for the /parks index grid. Every album
 * must flag exactly PREVIEW_COUNT photos `preview: true`; anything else
 * (including an empty album) fails the build rather than rendering a
 * lopsided grid. The page is statically generated, so this runs once per
 * build and needs no caching.
 */
export async function hydrateAlbumsWithImages(
  albumsByYear: readonly [number, AlbumMeta[]][],
) {
  return Promise.all(
    albumsByYear.map(async ([year, yearAlbums]) => ({
      year,
      albums: await Promise.all(
        yearAlbums.map(async (album) => {
          const previews = (await loadAlbumPhotos(album.slug)).filter(
            (p) => p.preview,
          );
          if (previews.length !== PREVIEW_COUNT) {
            throw new Error(
              `Album "${album.slug}": expected exactly ${PREVIEW_COUNT} preview photos, found ${previews.length}`,
            );
          }
          return { ...album, images: previews };
        }),
      ),
    })),
  );
}
