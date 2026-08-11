// src/app/components/display/light/LightBox.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/lib/types";

export default function Lightbox({
  images,
  activeIndex,
  title = "Image viewer",
  onClose,
  onNavigate,
}: {
  images: Photo[];
  activeIndex: number;
  title?: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = images[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < images.length - 1;

  const containerRef = useRef<HTMLDivElement>(null);

  // Move focus onto the lightbox so the thumbnail button that opened it
  // (still focused from the click) doesn't pick up a stray keyboard-focus
  // ring the moment a key like Escape is pressed.
  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  // Lock background scroll while the lightbox is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        onNavigate(activeIndex - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        onNavigate(activeIndex + 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, hasPrev, hasNext, onClose, onNavigate]);

  const [vw, setVw] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const [vh, setVh] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 0,
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
    typeof item.src === "object" && "width" in item.src && "height" in item.src
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
  const alt = item.alt?.trim() || item.caption?.trim() || title;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 outline-none"
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
            unoptimized
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
