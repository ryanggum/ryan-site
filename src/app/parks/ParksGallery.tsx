"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Park = { name: string; title: string; images: string[] };
type Active = { parkIdx: number; imgIdx: number } | null;

export default function ParksGallery({ parks }: { parks: Park[] }) {
  const [active, setActive] = useState<Active>(null);

  const flat = useMemo(() => {
    const list: { parkIdx: number; imgIdx: number; src: string; title: string }[] = [];
    parks.forEach((p, pi) =>
      p.images.forEach((src, ii) =>
        list.push({ parkIdx: pi, imgIdx: ii, src, title: p.title })
      )
    );
    return list;
  }, [parks]);

  // ✅ Lock scroll when modal is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (active) {
      const prevHtmlOverflow = html.style.overflow;
      const prevBodyOverflow = body.style.overflow;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";

      return () => {
        html.style.overflow = prevHtmlOverflow;
        body.style.overflow = prevBodyOverflow;
      };
    }
  }, [active]);

  return (
    <>
      {parks.map((park, parkIdx) => (
        <section key={park.name} className="mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-medium mb-3 sm:mb-4">{park.title}</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {park.images.map((src, imgIdx) => (
              <div
                key={src}
                onClick={() => setActive({ parkIdx, imgIdx })}
                className="group relative block overflow-hidden cursor-pointer"
                aria-label={`Open ${park.title} photo ${imgIdx + 1}`}
              >
                <div className="relative w-full aspect-[3/2]">
                  <Image
                    src={src}
                    alt={`${park.title} photo ${imgIdx + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-w-[100vw] sm:max-w-[92vw] max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={parks[active.parkIdx].images[active.imgIdx]}
              alt=""
              className="max-w-[96vw] sm:max-w-[90vw] max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
