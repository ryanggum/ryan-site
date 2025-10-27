// src/app/parks/DisplayGrid.tsx
"use client";

import Image, { type StaticImageData } from "next/image";
import { memo, useMemo, useState } from "react";
import type { Photo } from "@/lib/types";
import Lightbox, { type LightboxItem } from "./LightBox";

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
        <Lightbox
          item={items[active] as LightboxItem}
          title="Image viewer"
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

export default memo(DisplayGridBase);
