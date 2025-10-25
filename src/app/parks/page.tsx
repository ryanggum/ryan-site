// app/parks/page.tsx

import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import DisplayGrid from "./DisplayGrid";

// bring in your canonical types (adjust the import path to wherever you defined them)
import type {
  Manifest,
  ManifestAsset,
  AlbumJson,
  AssetMeta,
} from "@/lib/manifest"; // <- update path if needed

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PREVIEW_LIMIT = 3;

// local alias using your existing types (not redefining)
type AnyAsset = ManifestAsset | AssetMeta;

// minimal, local type guards (no new type declarations)
const hasUrl = (a: AnyAsset): a is ManifestAsset => "url" in a;
const hasFile = (a: AnyAsset): a is AssetMeta => "file" in a;

// ---------- Inlined ParksGallery (server component; can render client children) ----------
export type Park = { name: string; title: string; images: string[] };

function ParksGallery({ parks }: { parks: Park[] }) {
  return (
    <>
      {parks.map((park) => (
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
      ))}
    </>
  );
}
// ---------------------------------------------------------------------------------------

export default async function ParksPage() {
  const manifestPath = path.join(process.cwd(), "generated", "content.v1.json");
  const raw = await fs.readFile(manifestPath, "utf8");

  // Accept either the canonical Manifest (assets with `url`)
  // or the album.json shape (assets with `file`) without redefining types.
  const data = JSON.parse(raw) as Manifest | { albums: AlbumJson[] };

  const parks: Park[] = data.albums.map((a) => {
    const images = (a.assets as AnyAsset[])
      .filter((x) => !x.hidden)
      .slice(0, PREVIEW_LIMIT)
      .map((x) =>
        hasUrl(x) ? x.url : hasFile(x) ? `/images/${a.id}/${x.file}` : null
      )
      .filter((u): u is string => Boolean(u));

    return {
      name: a.id,
      title: a.title,
      images,
    };
  });

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
        <ParksGallery parks={parks} />
      </div>
    </main>
  );
}
