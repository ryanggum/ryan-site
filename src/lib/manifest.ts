// src/lib/manifest.ts

import fs from "node:fs/promises";
import path from "node:path";

// ===== canonical types =====
export type Orientation = "landscape" | "portrait";

export type ManifestAsset = {
  id: string;
  url: string;
  caption: string;
  orientation: Orientation;
  sequence: number;
  hidden?: boolean;
};

export type ManifestAlbum = {
  id: string;
  title: string;
  sequence: number;
  assets: ManifestAsset[];
};

export type Manifest = {
  generatedAt: string;
  albums: ManifestAlbum[];
};

// album.json types
export type AssetMeta = {
  file: string;
  caption: string;
  orientation: Orientation;
  sequence: number;
  hidden?: boolean;
};

export type AlbumJson = {
  id: string;
  title: string;
  sequence: number;
  assets: AssetMeta[];
};

// ===== quiet reader (returns null on miss) =====
export async function readManifestQuiet(
  file = path.join(process.cwd(), "generated", "content.json")
): Promise<Manifest | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Manifest;
  } catch {
    return null;
  }
}
