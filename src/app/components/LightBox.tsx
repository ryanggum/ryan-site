// src/app/parks/components/LightBox.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Photo } from "@/lib/types";

export default function Lightbox({
  item,
  title = "Image viewer",
  onClose,
}: {
  item: Photo;
  title?: string;
  onClose: () => void;
}) {
  const [vw, setVw] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [vh, setVh] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  useEffect(() => {
    function onResize() {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const staticDims =
    typeof item.src === "object" &&
    "width" in item.src &&
    "height" in item.src
      ? { w: item.src.width, h: item.src.height }
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

  // ✅ GUARANTEED non-empty alt text
  const alt =
    item.alt?.trim() ||
    item.caption?.trim() ||
    title;

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
            alt={alt}
            width={Math.round(finalBox.w)}
            height={Math.round(finalBox.h)}
            className="pointer-events-auto object-contain"
            priority
            onClick={(e) => e.stopPropagation()}
            onLoadingComplete={(img) => {
              if (!knownAspect) {
                const a = img.naturalWidth / img.naturalHeight || null;
                if (a && Math.abs(a - (loadedAspect ?? a + 1)) > 0.001) {
                  setLoadedAspect(a);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
