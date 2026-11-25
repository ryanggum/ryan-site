// src/app/components/display/DisplayGrid.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type { AspectRatio, Photo, Video } from "@/lib/types";
import Lightbox from "./Lightbox";

// A grid is all photos or all clips, never mixed: pass exactly one.
type Media =
  { images: Photo[]; videos?: never } | { videos: Video[]; images?: never };

export default function DisplayGrid({
  title,
  images,
  videos,
  width,
  columns,
  ratio,
  priority = false,
  sizes,
}: Media & {
  title: string;
  /** Max rendered width in px; the grid shrinks below it with its container. */
  width?: number;
  /** Fixed column count at every breakpoint. Defaults to 1/2/3 by image count. */
  columns?: number;
  /**
   * Tile shape; media is cropped to it (object-cover). Photos default to
   * 3:2 for the film scans (pass "4/3" for phone shots so they aren't
   * trimmed). Clips default to each one's own shape, read from its poster.
   * The lightbox always shows the full photo or clip.
   */
  ratio?: AspectRatio;
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

  const count = images?.length ?? videos?.length ?? 0;
  const cols = columns ?? (Math.min(count, 3) || 1);

  // Fallback: `auto` (rendered width, for lazy images in supporting
  // browsers), then one column's share of the viewport, capped at one
  // column's share of `width` once the viewport is wider than that. The
  // estimate ignores padding and gaps, so it only ever errs larger.
  const columnVw = `${Math.round(100 / cols)}vw`;
  const imageSizes =
    sizes ??
    `auto, ${
      width
        ? `(max-width: ${width}px) ${columnVw}, ${Math.round(width / cols)}px`
        : columnVw
    }`;

  return (
    <>
      <div
        className="grid w-full gap-2 sm:gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: width,
        }}
      >
        {videos?.map((video, idx) => (
          <div key={idx}>
            <button
              type="button"
              onClick={() => setActive(idx)}
              className="group relative block w-full cursor-pointer overflow-hidden"
              style={{
                aspectRatio:
                  ratio ?? `${video.poster.width}/${video.poster.height}`,
              }}
              aria-label={`Open ${title} video ${idx + 1}`}
            >
              {/* GIF-style: browsers only autoplay muted video, and iOS
                  needs playsInline or it takes the clip fullscreen. */}
              <video
                src={video.src}
                poster={video.poster.src}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
              />
            </button>

            {video.caption && (
              <div className="text-sm text-gray-500 leading-tight">
                {video.caption}
              </div>
            )}
          </div>
        ))}

        {images?.map((photo, idx) => {
          const eager = priority && idx === 0;
          return (
            <div key={idx}>
              <button
                type="button"
                onClick={() => setActive(idx)}
                className="group relative block w-full cursor-pointer overflow-hidden"
                style={{ aspectRatio: ratio ?? "3/2" }}
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
          {...(images ? { images } : { videos })}
          activeIndex={active}
          title={title}
          onClose={() => setActive(null)}
          onNavigate={setActive}
        />
      )}
    </>
  );
}
