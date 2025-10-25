// src/lib/manifest.ts

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

/**
 * Fetch the manifest from /content.json (served from /public).
 *
 * @param origin Optional absolute origin (e.g. "https://example.com").
 *               If omitted, uses NEXT_PUBLIC_SITE_URL, then http://localhost:3000 (dev).
 * @returns Manifest or null on any failure.
 *
 * Usage in a server component:
 *   const h = await headers();
 *   const host = h.get("x-forwarded-host") ?? h.get("host")!;
 *   const proto = h.get("x-forwarded-proto") ?? "https";
 *   const manifest = await fetchManifestQuiet(`${proto}://${host}`);
 */
export async function fetchManifestQuiet(origin?: string): Promise<Manifest | null> {
  const base =
    origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"; // sensible dev fallback

  try {
    const res = await fetch(`${base}/content.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Manifest;
  } catch {
    return null;
  }
}
