// src/app/parks/DisplayGrid.tsx
"use client";

import Image, { type StaticImageData } from "next/image";
import { memo, useEffect, useMemo, useState } from "react";
import type { Photo } from "@/lib/types";

type GridItem = { src: StaticImageData | string; alt: string };

function isPhoto(x: unknown): x is Photo {
  return !!x && typeof x === "object" && "src" in (x as any) && "alt" in (x as any);
}
function isStaticImageData(x: unknown): x is StaticImageData {
  return (
    !!x &&
    typeof x === "object" &&
    "src" in (x as any) &&
    "width" in (x as any) &&
    "height" in (x as any)
  );
}

function DisplayGridBase({
  title,
  images,
}: {
  title: string;
  images: (StaticImageData | Photo | string)[];
}) {
  const [active, setActive] = useState<number | null>(null);

  const items: GridItem[] = useMemo(() => {
    if (!images?.length) return [];
    return images.map((it, idx) =>
      isPhoto(it)
        ? { src: it.src, alt: it.alt || `${title} photo ${idx + 1}` }
        : isStaticImageData(it)
        ? { src: it, alt: `${title} photo ${idx + 1}` }
        : { src: it as string, alt: `${title} photo ${idx + 1}` }
    );
  }, [images, title]);

  useEffect(() => {
    if (active === null) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className="group relative block overflow-hidden cursor-pointer"
            aria-label={`Open ${title} photo ${idx + 1}`}
          >
            <div className="relative w-full aspect-[3/2]">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                placeholder={typeof item.src === "object" ? "blur" : undefined}
                priority={idx < 3}
              />
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={() => setActive(null)}
        >
          {/* Make everything except the image itself click-through */}
          <div className="pointer-events-none relative max-w-[100vw] sm:max-w-[92vw] max-h-[88vh] flex items-center justify-center">
            <div className="pointer-events-none relative w-[96vw] sm:w-[90vw] h-[80vh]">
              <Image
                src={items[active].src}
                alt={items[active].alt}
                fill
                className="pointer-events-auto object-contain"
                priority
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(DisplayGridBase);
