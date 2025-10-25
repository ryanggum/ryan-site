// app/parks/page.tsx

import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import DisplayGrid from "./DisplayGrid";

import type {
  Manifest,
  ManifestAsset,
  AlbumJson,
  AssetMeta,
} from "@/lib/manifest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PREVIEW_LIMIT = 3;

type AnyAsset = ManifestAsset | AssetMeta;

// Type guards (local, minimal)
const hasUrl = (a: AnyAsset): a is ManifestAsset =>
  a != null && typeof a === "object" && "url" in a;
const hasFile = (a: AnyAsset): a is AssetMeta =>
  a != null && typeof a === "object" && "file" in a;

export type Park = { name: string; title: string; images: string[] };

export default async function ParksPage() {
  const manifestPath = path.join(process.cwd(), "generated", "content.json");

  let data: Manifest | { albums: AlbumJson[] } | null = null;
  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    data = JSON.parse(raw) as Manifest | { albums: AlbumJson[] };
  } catch {
    data = null;
  }

  const parks: Park[] =
    data?.albums?.map((a: Manifest["albums"][number] | AlbumJson) => {
      const images = (a.assets as AnyAsset[])
        .filter((x) => !("hidden" in x && x.hidden)) // respect hidden when present
        .slice(0, PREVIEW_LIMIT)
        .map((x) =>
          hasUrl(x)
            ? x.url
            : hasFile(x)
            ? // fallback to raw album.json shape -> public path
              `/parks/${a.id}/${x.file}`
            : null
        )
        .filter((u): u is string => Boolean(u));

      return { name: a.id, title: a.title, images };
    }) ?? [];

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
            No parks found. Generate a manifest at <code>generated/content.json</code>.
          </p>
        )}
      </div>
    </main>
  );
}
