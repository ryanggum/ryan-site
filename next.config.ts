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
};

export default nextConfig;
