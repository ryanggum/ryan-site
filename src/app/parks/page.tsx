// app/parks/page.tsx
import fs from "fs";
import path from "path";
import Link from "next/link";
import ParksGallery from "./ParksGallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

type ParksMeta = {
  order?: string[];
  parks?: {
    [folder: string]: {
      title?: string;
      order?: string[]; // image filenames in desired order
      hidden?: boolean;
    };
  };
};

type Park = { name: string; title: string; images: string[] };

function readJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function sortByOrder<T extends string>(items: T[], order?: T[]) {
  if (!order || order.length === 0) return items;
  const index = new Map(order.map((k, i) => [k, i]));
  return [...items].sort((a, b) => {
    const ai = index.has(a) ? (index.get(a) as number) : Number.POSITIVE_INFINITY;
    const bi = index.has(b) ? (index.get(b) as number) : Number.POSITIVE_INFINITY;
    if (ai !== bi) return ai - bi;
    // fallback: alphabetical for anything not in the order list
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });
}

export default async function ParksPage() {
  const parksDir = path.join(process.cwd(), "public", "parks");

  const metaPath = path.join(parksDir, "_meta.json");
  const meta = readJson<ParksMeta>(metaPath) ?? {};

  // Folders only
  let parkFolders = fs
    .readdirSync(parksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  // Hide folders via meta
  if (meta.parks) {
    parkFolders = parkFolders.filter((f) => !meta.parks?.[f]?.hidden);
  }

  // Apply folder order from meta (with alphabetical fallback)
  parkFolders = sortByOrder(
    parkFolders,
    meta.order
  );

  const parks: Park[] = parkFolders.map((folder) => {
    const folderPath = path.join(parksDir, folder);

    // list image files
    const files = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .filter(
        (d) =>
          d.isFile() &&
          !d.name.startsWith(".") &&
          IMAGE_EXTS.has(path.extname(d.name).toLowerCase())
      )
      .map((d) => d.name);

    // per-park image ordering via meta, with graceful fallback
    const perParkOrder = meta.parks?.[folder]?.order;
    const orderedFiles = sortByOrder(files, perParkOrder);

    const images = orderedFiles.map((name) => `/parks/${folder}/${name}`);

    const title = meta.parks?.[folder]?.title ?? folder;

    return { name: folder, title, images };
  });

  return (
    <main className="relative min-h-dvh px-48 py-24 select-none">
      {/* Header */}
      <header className="mb-12 flex flex-col items-center">
        <h1 className="text-5xl font-medium mb-2">parks</h1>
        <Link
          href="/"
          className="text-neutral-500 text-lg hover:text-neutral-700 transition-colors"
        >
          ← ryan gumlia
        </Link>
      </header>

      {/* Gallery */}
      <div className="max-w-4xl mx-auto">
        <ParksGallery parks={parks} />
      </div>
    </main>
  );
}
