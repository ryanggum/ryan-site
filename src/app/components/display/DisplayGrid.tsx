// src/app/components/display/DisplayGrid.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/lib/types";
import Lightbox from "./light/LightBox";

export default function DisplayGrid({
  title,
  images,
  width,
  columns,
  priority = false,
  sizes,
}: {
  title: string;
  images: Photo[];
  /** Max rendered width in px; the grid shrinks below it with its container. */
  width?: number;
  /** Fixed column count at every breakpoint. Defaults to 1/2/3 by image count. */
  columns?: number;
  /** Load the first thumbnail eagerly at high fetch priority (above the fold). */
  priority?: boolean;
  /**
   * Exact `sizes` for each thumbnail. Callers that know their page padding
   * should pass this: the fallback below assumes the grid spans the full
   * viewport, which over-fetches (and spreads requests across more cached
   * width variants) whenever the grid is padded or capped.
   */
  sizes?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const cols = columns ?? (Math.min(images.length, 3) || 1);

  // Fallback: one column's share of the viewport, capped at one column's
  // share of `width` once the viewport is wider than that.
  const columnVw = `${Math.round(100 / cols)}vw`;
  const imageSizes =
    sizes ??
    (width
      ? `(max-width: ${width}px) ${columnVw}, ${Math.round(width / cols)}px`
      : columnVw);

  return (
    <>
      <div
        className="grid w-full gap-2 sm:gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: width,
        }}
      >
        {images.map((photo, idx) => {
          const eager = priority && idx === 0;
          return (
            <div key={idx}>
              <button
                type="button"
                onClick={() => setActive(idx)}
                className="group relative block aspect-[3/2] w-full cursor-pointer overflow-hidden"
                aria-label={`Open ${title} photo ${idx + 1}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt?.trim() || `${title} photo ${idx + 1}`}
                  fill
                  // `priority` on next/image is deprecated in Next 16;
                  // eager + high fetch priority is the recommended
                  // replacement for an above-the-fold image that's already
                  // in the server HTML.
                  loading={eager ? "eager" : undefined}
                  fetchPriority={eager ? "high" : undefined}
                  sizes={imageSizes}
                  quality={100}
                  // Static JPEG imports always carry a blurDataURL.
                  placeholder="blur"
                  className="object-cover transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                />
              </button>

              {photo.caption && (
                <div className="text-sm text-gray-500 leading-tight">
                  {photo.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {active !== null && (
        <Lightbox
          images={images}
          activeIndex={active}
          title={title}
          onClose={() => setActive(null)}
          onNavigate={setActive}
        />
      )}
    </>
  );
}
