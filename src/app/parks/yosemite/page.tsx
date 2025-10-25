// app/parks/yosemite/page.tsx
import { headers } from "next/headers";
import Link from "next/link";
import DisplayGrid from "../DisplayGrid";
import type { Manifest } from "@/lib/manifest";
import { fetchManifestQuiet } from "@/lib/manifest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function YosemitePage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host")!;
  const proto = h.get("x-forwarded-proto") ?? "https";

  const manifest: Manifest | null = await fetchManifestQuiet(`${proto}://${host}`);

  const yosemiteAlbum = manifest?.albums?.find((a) => a.id === "yosemite");
  const images: string[] =
    yosemiteAlbum?.assets?.filter((x) => !x.hidden).map((x) => x.url) ?? [];

  const hasImages = images.length > 0;

  return (
    <main className="relative min-h-dvh px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20 select-none">
      <header className="mb-8 sm:mb-12 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2">yosemite</h1>
        <Link
          href="/"
          className="text-neutral-500 text-base sm:text-lg hover:text-neutral-700 transition-colors"
        >
          ← ryan gumlia
        </Link>
        <Link
          href="/parks"
          className="text-neutral-500 text-base sm:text-lg hover:text-neutral-700 transition-colors"
        >
          ← parks
        </Link>
      </header>

      {hasImages ? (
        <DisplayGrid title="yosemite" images={images} />
      ) : (
        <div className="text-center text-neutral-500">No Yosemite images found.</div>
      )}
    </main>
  );
}
