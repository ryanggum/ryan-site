// scripts/ingest.ts

import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import {
  AlbumJson,
  Manifest,
  ManifestAlbum,
  ManifestAsset,
} from "../src/lib/manifest";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");                 // <-- define this
const PUBLIC_PARKS = path.join(PUBLIC_DIR, "parks");
const MANIFEST_PATH = path.join(PUBLIC_DIR, "content.json");  // <-- write to /public
const LOCALE_OPTS: Intl.CollatorOptions = { numeric: true, sensitivity: "base" };

// --- utils ---
async function readJson<T>(p: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function numFromFilename(name: string): number {
  const m = /^(\d+)/.exec(name);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function sortBySequenceThenAlpha<T extends { sequence: number }>(
  items: T[],
  alphaKey: keyof T
) {
  return [...items].sort((a, b) => {
    if (a.sequence !== b.sequence) return a.sequence - b.sequence;
    const av = String(a[alphaKey]);
    const bv = String(b[alphaKey]);
    return av.localeCompare(bv, undefined, LOCALE_OPTS);
  });
}

// --- album builder ---
async function buildAlbum(folder: string): Promise<ManifestAlbum | null> {
  const albumDir = path.join(PUBLIC_PARKS, folder);
  const albumJson = await readJson<AlbumJson>(path.join(albumDir, "album.json"));
  if (!albumJson || !albumJson.assets?.length) {
    console.warn(`Skipping "${folder}"`);
    return null;
  }

  const validated = albumJson.assets.filter((a) =>
    existsSync(path.join(albumDir, a.file))
  );
  if (!validated.length) {
    console.warn(`Skipping "${folder}" (no valid image files)`);
    return null;
  }

  const ordered = sortBySequenceThenAlpha(
    validated.map((a) => ({ ...a, filename: a.file })),
    "filename"
  );

  const assets: ManifestAsset[] = ordered.map((a) => ({
    id: `${folder}-${a.file}`,
    url: `/${path.posix.join("parks", folder, a.file)}`,
    caption: a.caption,
    orientation: a.orientation,
    sequence: a.sequence,
    hidden: a.hidden,
  }));

  return {
    id: albumJson.id ?? folder,
    title: albumJson.title,
    sequence: albumJson.sequence,
    assets,
  };
}

// --- main ---
async function main() {
  if (!existsSync(PUBLIC_PARKS)) {
    console.error(`No parks directory at ${PUBLIC_PARKS}`);
    process.exit(1);
  }

  const folders = (await fs.readdir(PUBLIC_PARKS, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  const albums = (await Promise.all(folders.map(buildAlbum))).filter(
    (a): a is ManifestAlbum => Boolean(a)
  );

  if (!albums.length) {
    console.error("No albums generated.");
    process.exit(1);
  }

  albums.sort((a, b) => {
    if (a.sequence !== b.sequence) return a.sequence - b.sequence;
    return a.id.localeCompare(b.id, undefined, LOCALE_OPTS);
  });

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    albums,
  };

  await fs.mkdir(PUBLIC_DIR, { recursive: true });           // <-- ensure /public exists
  const tmp = `${MANIFEST_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(manifest, null, 2), "utf8");
  await fs.rename(tmp, MANIFEST_PATH);

  console.log(`✅ Manifest generated: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
