// src/app/parks/components/LightBox.tsx
"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useMemo, useState } from "react";

export type LightboxItem = { src: StaticImageData | string; alt: string };

export default function Lightbox({
  item,
  title = "Image viewer",
  onClose,
}: {
  item: LightboxItem;
  title?: string;
  onClose: () => void;
}) {
  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);
  const [vh, setVh] = useState<number>(typeof window !== "undefined" ? window.innerHeight : 0);

  useEffect(() => {
    function onResize() {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const staticDims =
    typeof item.src === "object" && "width" in item.src && "height" in item.src
      ? { w: (item.src as StaticImageData).width, h: (item.src as StaticImageData).height }
      : null;

  const knownAspect = staticDims ? staticDims.w / staticDims.h : null;

  const box = useMemo(() => {
    const maxW = vw * 0.92;
    const maxH = vh * 0.88;
    const aspect = knownAspect ?? 3 / 2;
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    return { w, h };
  }, [vw, vh, knownAspect]);

  const [loadedAspect, setLoadedAspect] = useState<number | null>(null);
  const finalBox = useMemo(() => {
    const aspect = loadedAspect ?? knownAspect;
    if (!aspect) return box;
    const maxW = vw * 0.92;
    const maxH = vh * 0.88;
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    return { w, h };
  }, [box, vw, vh, loadedAspect, knownAspect]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="pointer-events-none flex items-center justify-center">
        <div
          className="pointer-events-none relative"
          style={{ width: finalBox.w, height: finalBox.h }}
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={Math.round(finalBox.w)}
            height={Math.round(finalBox.h)}
            className="pointer-events-auto object-contain"
            priority
            onClick={(e) => e.stopPropagation()}
            onLoadingComplete={(img) => {
              if (!knownAspect) {
                const a = img.naturalWidth / img.naturalHeight || null;
                if (a && Math.abs(a - (loadedAspect ?? a + 1)) > 0.001) setLoadedAspect(a);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
