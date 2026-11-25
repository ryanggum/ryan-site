import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only 100 is ever requested (DisplayGrid); allowlisting 75 too doubled
    // every image's cache-write footprint for a quality nothing used.
    qualities: [100],
    // Photos are immutable once published, so cache each optimized variant
    // indefinitely instead of Next's 4h default (which was causing repeated
    // re-optimization/cache-write churn on every-page-view-after-expiry).
    minimumCacheTTL: 31536000,
  },
  turbopack: {
    rules: {
      // Let post clips be static-imported next to their photos: Turbopack
      // has no built-in mp4 handling, and `asset` emits the file and
      // resolves the import to its hashed URL (typed in src/video.d.ts).
      "*.mp4": { type: "asset" },
    },
  },
};

export default nextConfig;
