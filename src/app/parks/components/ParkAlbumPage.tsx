// src/app/parks/ParkAlbumPage.tsx
import Link from "next/link";
import DisplayGrid from "./DisplayGrid";
import { getAlbumMeta } from "@/lib/albums";
import type { AlbumModule } from "@/lib/types";

const shell =
  "relative min-h-dvh px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20 select-none";
const headerBox = "mb-8 sm:mb-12 flex flex-col items-center";
const backLink =
  "text-neutral-500 text-base sm:text-lg hover:text-neutral-700 transition-colors";

function Header({ title }: { title: string }) {
  return (
    <header className={headerBox}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2">{title}</h1>
      <Link href="/" className={backLink}>
        ← ryan gumlia
      </Link>
      <Link href="/parks" className={backLink}>
        ← parks
      </Link>
    </header>
  );
}

export default async function ParkAlbumPage({ album }: { album: string }) {
  const meta = getAlbumMeta(album);

  if (!meta) {
    return (
      <main className={shell}>
        <Header title={album} />
        <div className="text-center text-neutral-500">Album not found.</div>
      </main>
    );
  }

  const { default: images } = (await import(
    `@/app/assets/parks/${meta.slug}/photos`
  )) as AlbumModule;

  return (
    <main className={shell}>
      <Header title={meta.title} />
      {images.length ? (
        <DisplayGrid title={meta.title} images={images} />
      ) : (
        <div className="text-center text-neutral-500">No images found.</div>
      )}
    </main>
  );
}
