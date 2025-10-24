// app/parks/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import ParksGallery from "./ParksGallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ManifestAsset = {
  id: string;
  url: string;
  caption?: string;
  format?: "landscape" | "portrait" | "square";
  sequence?: number;
  hidden?: boolean;
};

type ManifestAlbum = {
  id: string;
  title: string;
  sequence?: number;
  assets: ManifestAsset[];
};

type ManifestV1 = {
  version: 1;
  generatedAt: string;
  albums: ManifestAlbum[];
};

export default async function ParksPage() {
  const manifestPath = path.join(process.cwd(), "generated", "content.v1.json");
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest: ManifestV1 = JSON.parse(raw);

  const parks = manifest.albums.map((a) => ({
    name: a.id,
    title: a.title,
    images: a.assets.filter(x => !x.hidden).map((x) => x.url),
  }));

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
