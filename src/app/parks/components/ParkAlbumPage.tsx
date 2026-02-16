// src/app/parks/components/ParkAlbumPage.tsx

import DisplayGrid from "../../components/DisplayGrid";
import { getAlbumMeta } from "@/lib/rolls";
import type { AlbumModule } from "@/lib/types";

const shell =
  "relative min-h-dvh box-border overflow-x-clip px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20";
const headerBox = "mb-3 flex flex-col items-center";

function Header({ title }: { title: string }) {
  return (
    <header className={headerBox}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-3">
        {title}
      </h1>
    </header>
  );
}

export default async function ParkAlbumPage({ album }: { album: string }) {
  const meta = getAlbumMeta(album);

  let content;

  if (!meta) {
    content = <div className="text-center text-neutral-500">No Album</div>;
  } else {
    const { default: images } = (await import(
      /* webpackInclude: /\.\/[^/]+\/photos$/ */
      `@/app/assets/parks/${meta.slug}/photos`
    )) as AlbumModule;

    content = images.length ? (
      <DisplayGrid title={meta.title} images={images} />
    ) : (
      <div className="text-center text-neutral-500">No Images</div>
    );
  }

  return (
    <main className={shell}>
      <Header title={meta?.title ?? album} />
      <div className="mb-4 border-t border-black dark:border-white" />
      {content}
    </main>
  );
}
