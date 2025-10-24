/* eslint-disable no-console */
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

// Types
type AssetMeta = {
  file: string; // "1.jpg"
  caption?: string;
  format?: "landscape" | "portrait" | "square";
  sequence?: number;
  hidden?: boolean;
};

type AlbumJson = {
  id: string;             // "yosemite"
  title: string;          // "Yosemite"
  sequence?: number;      // album order
  assets?: AssetMeta[];
};

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

// Constants
const ROOT = process.cwd();
const PUBLIC_PARKS = path.join(ROOT, "public", "parks");
const GENERATED_DIR = path.join(ROOT, "generated");
const MANIFEST_PATH = path.join(GENERATED_DIR, "content.v1.json");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

// Helpers
async function readJson<T>(p: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function numFromFilename(name: string): number {
  const m = name.match(/^(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function sortBySequenceThenAlpha<T extends { sequence?: number }>(
  items: T[],
  alphaKey: keyof T
) {
  return [...items].sort((a, b) => {
    const sa = a.sequence ?? Number.POSITIVE_INFINITY;
    const sb = b.sequence ?? Number.POSITIVE_INFINITY;
    if (sa !== sb) return sa - sb;
    const av = String(a[alphaKey]);
    const bv = String(b[alphaKey]);
    return av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
  });
}

async function listImages(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((d) => d.isFile() && IMAGE_EXTS.has(path.extname(d.name).toLowerCase()))
    .map((d) => d.name)
    .sort((a, b) => {
      const na = numFromFilename(a);
      const nb = numFromFilename(b);
      if (na !== nb) return na - nb;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });
}

// Build album
async function buildAlbum(folder: string): Promise<ManifestAlbum | null> {
  const albumDir = path.join(PUBLIC_PARKS, folder);
  const albumJson = await readJson<AlbumJson>(path.join(albumDir, "album.json"));
  if (!albumJson) {
    console.warn(`Skipping "${folder}" (no album.json found)`);
    return null;
  }

  const title = albumJson.title ?? folder;
  const sequence = albumJson.sequence;

  let assetsFromJson = albumJson.assets ?? [];

  // If no asset array in album.json, scan directory for images
  if (assetsFromJson.length === 0) {
    const files = await listImages(albumDir);
    assetsFromJson = files.map((file) => ({
      file,
      sequence: numFromFilename(file),
    }));
  }

  // Validate existence
  const validated = assetsFromJson.filter((a) =>
    existsSync(path.join(albumDir, a.file))
  );

  // Sort assets
  const ordered = sortBySequenceThenAlpha(
    validated.map((a) => ({ ...a, filename: a.file })),
    "filename"
  );

  const manifestAssets: ManifestAsset[] = ordered.map((a) => ({
    id: `${folder}-${a.file}`,
    url: `/${path.posix.join("parks", folder, a.file)}`,
    caption: a.caption,
    format: a.format,
    sequence: a.sequence ?? numFromFilename(a.file),
    hidden: a.hidden ?? false,
  }));

  return {
    id: folder,
    title,
    sequence,
    assets: manifestAssets,
  };
}

// Main
async function main() {
  if (!existsSync(PUBLIC_PARKS)) {
    console.error(`No parks directory at ${PUBLIC_PARKS}`);
    process.exit(1);
  }

  const folders = (await fs.readdir(PUBLIC_PARKS, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  const albums: ManifestAlbum[] = [];
  for (const folder of folders) {
    const album = await buildAlbum(folder);
    if (album) albums.push(album);
  }

  albums.sort((a, b) => {
    const sa = a.sequence ?? Number.POSITIVE_INFINITY;
    const sb = b.sequence ?? Number.POSITIVE_INFINITY;
    if (sa !== sb) return sa - sb;
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" });
  });

  const manifest: ManifestV1 = {
    version: 1,
    generatedAt: new Date().toISOString(),
    albums,
  };

  await fs.mkdir(GENERATED_DIR, { recursive: true });
  const tmp = `${MANIFEST_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(manifest, null, 2), "utf8");
  await fs.rename(tmp, MANIFEST_PATH);

  console.log(`✅ Manifest generated: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
