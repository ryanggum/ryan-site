// src/app/parks/components/Album.tsx
import DisplayGrid from "../../components/display/DisplayGrid";
import type { AlbumMeta, Photo } from "@/lib/types";

const shell =
  "relative min-h-dvh box-border overflow-x-clip py-10 sm:py-14 md:py-20";

// `auto` lets supporting browsers use the grid's real rendered width for
// lazy thumbnails, so it can't drift from the layout. The rest is the
// fallback (non-supporting browsers, and the eager `priority` image):
// one column of the 3-up album grid — viewport minus the grid section's
// horizontal padding (px-4/6/12/24, xl:px-74 = 296px) and two grid gaps
// (gap-2/sm:gap-4), divided by 3. Keep in sync with the section below.
const GRID_SIZES = [
  "auto",
  "(min-width: 1280px) calc((100vw - 624px) / 3)",
  "(min-width: 1024px) calc((100vw - 224px) / 3)",
  "(min-width: 768px) calc((100vw - 128px) / 3)",
  "(min-width: 640px) calc((100vw - 80px) / 3)",
  "calc((100vw - 48px) / 3)",
].join(", ");

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
        <DisplayGrid
          title={meta.title}
          images={images}
          columns={3}
          priority
          sizes={GRID_SIZES}
        />
      </section>
    </main>
  );
}
