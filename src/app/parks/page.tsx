// src/app/parks/page.tsx
import Link from "next/link";
import DisplayGrid from "./components/DisplayGrid";

import { albums } from "@/lib/albums";
import type { AlbumModule } from "@/lib/types";
import type { StaticImageData } from "next/image";

export type Park = { name: string; title: string; images: StaticImageData[] };

export default async function ParksPage() {
  const parks: Park[] = await Promise.all(
    albums.map(async (a) => {
      const mod = (await import(`@/app/assets/parks/${a.slug}/photos`)) as AlbumModule;
      const images = mod.default.filter(p => p.preview).map(p => p.src);
      return { name: a.slug, title: a.title, images };
    })
  );

  return (
    <main className="relative min-h-dvh px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20 select-none">
      <header className="mb-8 sm:mb-12 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2">parks</h1>
        <Link
          href="/"
          className="text-neutral-500 text-base sm:text-lg hover:text-neutral-700 transition-colors"
        >
          ← ryan gumlia
        </Link>
      </header>

      <div className="max-w-4xl mx-auto">
        {parks.length ? (
          parks.map((park) => (
            <section key={park.name} className="mb-10 sm:mb-16">
              <Link
                href={`/parks/${park.name}`}
                className="inline-flex items-center gap-1 hover:text-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded text-neutral-500 text-base sm:text-lg mb-3 sm:mb-4"
                aria-label={`Open ${park.title} gallery`}
              >
                <span>{park.title}</span>
                <span aria-hidden>→</span>
              </Link>
              <DisplayGrid title={park.title} images={park.images} />
            </section>
          ))
        ) : (
          <p className="text-center text-neutral-500">
						
          </p>
        )}
      </div>
    </main>
  );
}
