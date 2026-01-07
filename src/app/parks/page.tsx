// src/app/parks/page.tsx
import Link from "next/link";

import DisplayGrid from "../components/DisplayGrid";
import Header from "@/app/components/Header";

import { albums } from "@/lib/rolls";
import { groupAlbumsByYear, hydrateAlbumsWithImages } from "./util/util";

export default async function ParksPage() {
  const albumsByYear = groupAlbumsByYear(albums);
  const albumsWithImagesByYear = await hydrateAlbumsWithImages(albumsByYear);

  return (
    <main className="relative min-h-dvh select-none px-4 py-10 sm:px-6 sm:py-14 md:px-12 md:py-20 lg:px-24 xl:px-48 text-black dark:text-white">
      <Header title="rolls" />
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 border-t border-black dark:border-white" />
        {albumsWithImagesByYear.map(({ year, albums }) => (
          <section key={year} className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-2">{year}</h2>
            <div className="pl-2 sm:pl-6 space-y-6">
              {albums.map((album) => (
                <section key={album.slug}>
                  <div className="mb-2">
                    #{album.i}:{" "}
                    {album.page ? (
                      <>
                        <Link
                          href={`/parks/${album.slug}`}
                          className="inline-flex items-center gap-1 text-base sm:text-lg font-normal hover:text-neutral-500 transition-colors"
                        >
                          {album.title}
                        </Link>
                        {"→"}
                      </>
                    ) : (
                      <span className="text-base sm:text-lg font-normal">
                        {album.title}
                      </span>
                    )}
                  </div>
                  <div className="pl-2 sm:pl-6">
                    <DisplayGrid
                      title={album.title}
                      images={[...album.images]}
                    />
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
