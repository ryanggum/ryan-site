// app/parks/ParksGallery.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Park = { name: string; title: string; images: string[] };

export default function ParksGallery({ parks }: { parks: Park[] }) {
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setActiveSrc(null);
  }, []);

  useEffect(() => {
    if (!activeSrc) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeSrc, onKey]);

  return (
    <>
      {parks.map((park) => (
        <section key={park.name} className="mb-16">
          <h2 className="text-3xl font-medium mb-4">{park.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {park.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveSrc(src)}
                className="group relative block overflow-hidden focus:outline-none cursor-pointer"
                aria-label={`Open ${park.title} photo ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${park.title} photo ${i + 1}`}
                  width={600}
                  height={400}
                  className="object-cover transition-transform duration-200 ease-out group-hover:-translate-y-1"
                />
              </button>
            ))}
          </div>
        </section>
      ))}

      {activeSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 cursor-default"
          onClick={() => setActiveSrc(null)}
          role="dialog"
          aria-modal="true"
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div
            className="relative max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeSrc}
              alt="enlarged"
              className="max-w-full max-h-[85vh] object-contain cursor-default"
            />
          </div>
        </div>
      )}
    </>
  );
}
