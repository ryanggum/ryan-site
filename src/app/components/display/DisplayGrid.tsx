// app/components/DisplayGrid.tsx
"use client";

import Image from "next/image";
import { memo, useState, useMemo, useCallback } from "react";
import type { Photo } from "@/lib/types";
import Lightbox from "./light/LightBox";

function DisplayGridBase({
  title,
  images,
  width,
  height,
  columns,
  square = false,
  priority = false,
}: {
  title: string;
  images: Photo[];
  width?: number;
  height?: number;
  columns?: number;
  square?: boolean;
  priority?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  // Default column count (used only if `columns` is not provided)
  const effectiveColumns = useMemo(
    () => columns ?? (images.length === 1 ? 1 : images.length === 2 ? 2 : 3),
    [columns, images.length],
  );

  // Grid is a fixed number of columns at every breakpoint, so the browser
  // should never fetch an image wider than one column's share of the
  // container (or of the viewport, once the container shrinks below `width`).
  const imageSizes = useMemo(() => {
    const columnVw = `${Math.round(100 / effectiveColumns)}vw`;
    return width
      ? `(max-width: ${width}px) ${columnVw}, ${Math.round(width / effectiveColumns)}px`
      : columnVw;
  }, [width, effectiveColumns]);

  const aspectClass = useMemo(
    () => (square ? "aspect-square" : "aspect-[3/2]"),
    [square],
  );

  const openAtIndex = useCallback((idx: number) => {
    setActive(idx);
  }, []);

  const closeLightbox = useCallback(() => {
    setActive(null);
  }, []);

  return (
    <>
      <div
        className="overflow-hidden"
        style={{
          width: width ? "100%" : undefined,
          maxWidth: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
      >
        <div
          className="grid gap-2 sm:gap-4 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))`,
          }}
        >
          {images.map((photo, idx) => {
            const blurDataURL =
              typeof photo.src === "object" &&
              "blurDataURL" in photo.src &&
              photo.src.blurDataURL
                ? photo.src.blurDataURL
                : undefined;

            return (
              <div key={idx} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => openAtIndex(idx)}
                  className="group relative block overflow-hidden cursor-pointer p-0 m-0 border-0 bg-transparent"
                  aria-label={`Open ${title} photo ${idx + 1}`}
                >
                  <div className={`relative w-full ${aspectClass}`}>
                    <Image
                      src={photo.src}
                      alt={photo.alt?.trim() || `${title} photo ${idx + 1}`}
                      fill
                      priority={priority && idx === 0}
                      sizes={imageSizes}
                      quality={100}
                      className="object-cover transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                      placeholder={blurDataURL ? "blur" : "empty"}
                      blurDataURL={blurDataURL}
                    />
                  </div>
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
      </div>

      {active !== null && (
        <Lightbox
          images={images}
          activeIndex={active}
          title={title}
          onClose={closeLightbox}
          onNavigate={setActive}
        />
      )}
    </>
  );
}

export default memo(DisplayGridBase);
