// src/app/parks/components/Album.tsx (client)
"use client";

import DisplayGrid from "../../components/display/DisplayGrid";
import type { AlbumMeta, Photo } from "@/lib/types";

const shell =
  "relative min-h-dvh box-border overflow-x-clip py-10 sm:py-14 md:py-20";

export default function Album({
  meta,
  images,
}: {
  meta: AlbumMeta;
  images: Photo[];
}) {
  return (
    <main className={shell}>
      <header className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-62 mb-2 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2">
          {meta.title}
        </h1>
        <div className="w-full border-t border-black dark:border-white" />
      </header>
      <section className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-68 mb-8">
        <div>
          stock: {meta.film ? `${meta.film.stock} ${meta.film.iso}` : ""}
        </div>
      </section>
      <section className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-74">
        <DisplayGrid title={meta.title} images={images} columns={3} priority />
      </section>
    </main>
  );
}
