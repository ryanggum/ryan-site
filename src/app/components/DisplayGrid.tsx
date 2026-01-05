// app/components/DisplayGrid.tsx
"use client";

import Image from "next/image";
import { memo, useState, useMemo, useCallback } from "react";
import type { Photo } from "@/lib/types";
import Lightbox from "./LightBox";

function DisplayGridBase({
  title,
  images,
  width,
  height,
  columns,
  square = false,
}: {
  title: string;
  images: Photo[];
  width?: number;
  height?: number;
  columns?: number;
  square?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  // Default column logic (used only if `columns` is not provided)
  const fallbackColumnClass = useMemo(() => {
    if (images.length === 1) return "grid-cols-1";
    if (images.length === 2) return "grid-cols-2";
    return "grid-cols-3";
  }, [images.length]);

  const aspectClass = useMemo(
    () => (square ? "aspect-square" : "aspect-[3/2]"),
    [square]
  );

  const openAtIndex = useCallback((idx: number) => {
    setActive(idx);
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
          className={`grid gap-2 sm:gap-4 w-full h-full ${
            columns ? "" : fallbackColumnClass
          }`}
          style={
            columns
              ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
              : undefined
          }
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
                      priority={idx === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
          item={images[active]}
          title={title}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

export default memo(DisplayGridBase);
