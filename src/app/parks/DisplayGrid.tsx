// src/app/parks/DisplayGrid.tsx
"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ManifestAsset, Orientation } from "@/lib/manifest";

type SrcOnly = string;
type GridItem = { url: string; caption?: string; orientation?: Orientation };

function DisplayGridBase({
  title,
  images,
}: {
  title: string;
  images: SrcOnly[] | ManifestAsset[];
}) {
  const [active, setActive] = useState<number | null>(null);

  // Normalize input when 'images' changes
  const items: GridItem[] = useMemo(() => {
    if (!images?.length) return [];
    const first = images[0] as any;
    const isManifest = first && typeof first === "object" && "url" in first;

    return isManifest
      ? (images as ManifestAsset[]).map((a) => ({
          url: a.url,
          caption: a.caption,
          orientation: a.orientation,
        }))
      : (images as string[]).map((url) => ({ url }));
  }, [images]);

  const close = useCallback(() => setActive(null), []);
  const stop = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  const labelFor = useCallback(
    (idx: number) => `Open ${title} photo ${idx + 1}`,
    [title]
  );
  const altFor = useCallback(
    (idx: number) => items[idx].caption || `${title} photo ${idx + 1}`,
    [items, title]
  );

  // Scroll lock + Escape while modal is open
  useEffect(() => {
    if (active === null) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        {items.map((item, idx) => (
          <button
            key={item.url}
            onClick={() => setActive(idx)}
            className="group relative block overflow-hidden cursor-pointer"
            aria-label={labelFor(idx)}
          >
            <div className="relative w-full aspect-[3/2]">
              <Image
                src={item.url}
                alt={altFor(idx)}
                fill
                className="object-cover transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
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
          onClick={close}
        >
          <div
            className="relative max-w-[100vw] sm:max-w-[92vw] max-h-[88vh] flex items-center justify-center"
            onClick={stop}
          >
            <img
              src={items[active].url}
              alt={items[active].caption || ""}
              className={`max-w-[96vw] sm:max-w-[90vw] max-h-[80vh] object-contain transform ${
                items[active].orientation === "portrait" ? "-rotate-90 origin-center" : ""
              }`}
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  );
}

const DisplayGrid = React.memo(DisplayGridBase);
export default DisplayGrid;
