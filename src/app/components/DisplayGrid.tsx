// app/components/DisplayGrid.tsx
"use client";

import Image from "next/image";
import { memo, useState } from "react";
import type { Photo } from "@/lib/types";
import Lightbox from "./LightBox";

function DisplayGridBase({
  title,
  images,
  width,
  height,
}: {
  title: string;
  images: Photo[];
  width?: number;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);

  const columnClass =
    images.length === 1
      ? "grid-cols-1"
      : images.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <>
      <div
        className="overflow-hidden"
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
      >
        <div className={`grid ${columnClass} gap-2 sm:gap-4 w-full h-full`}>
          {images.map((photo, idx) => {
            const blurDataURL =
              typeof photo.src === "object" &&
              "blurDataURL" in photo.src &&
              photo.src.blurDataURL
                ? photo.src.blurDataURL
                : undefined;

            return (
              <div key={idx} className="flex flex-col">
                {/* Image */}
<button
  onClick={() => setActive(idx)}
  className="group relative block overflow-hidden cursor-pointer p-0 m-0 border-0 bg-transparent"
  aria-label={`Open ${title} photo ${idx + 1}`}
>
                  <div className="relative w-full aspect-[3/2]">
                    <Image
                      src={photo.src}
                      alt={photo.alt?.trim() || `${title} photo ${idx + 1}`}
                      fill
                      priority={idx < 3}
                      sizes="100vw"
                      className="object-cover transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                      placeholder={blurDataURL ? "blur" : "empty"}
                      blurDataURL={blurDataURL}
                    />
                  </div>
                </button>

                {/* Caption */}
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
