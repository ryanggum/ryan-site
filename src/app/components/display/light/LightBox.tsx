// src/app/components/display/light/LightBox.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/types";

// Minimum horizontal travel (px) for a touch to count as a swipe, and how
// much more horizontal than vertical it must be, so a sloppy tap or a
// mostly-vertical drag doesn't step photos.
const SWIPE_MIN_PX = 50;
const SWIPE_AXIS_RATIO = 1.5;

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

  // Originals are served unoptimized (~5MB each), so stepping with the arrow
  // keys would otherwise wait on a full download every time. Once the current
  // photo has loaded, warm the browser cache with the previous and next
  // originals. Started from onLoad, not on mount, so they don't compete for
  // bandwidth with the photo actually being viewed. Holding the elements in a
  // ref keeps them from being garbage-collected mid-download and dedupes
  // repeat requests while this lightbox stays open.
  const preloadedRef = useRef(new Map<string, HTMLImageElement>());
  function preloadNeighbors() {
    for (const i of [activeIndex + 1, activeIndex - 1]) {
      const url = images[i]?.src.src;
      if (!url || preloadedRef.current.has(url)) continue;
      const img = new window.Image();
      img.src = url;
      preloadedRef.current.set(url, img);
    }
  }

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

  // Swipe left/right steps through the set (same no-wraparound rule as the
  // arrow keys); a tap still closes. Multi-finger touches are ignored so
  // pinch-zoom works, and swipes are ignored while pinch-zoomed in so a
  // one-finger pan to inspect detail doesn't change the photo. `swipedRef`
  // swallows the click some browsers still fire at the end of a swipe, which
  // would otherwise close the lightbox right after navigating.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    swipedRef.current = false;
    touchStartRef.current =
      e.touches.length === 1
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || (window.visualViewport?.scale ?? 1) > 1) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (
      Math.abs(dx) < SWIPE_MIN_PX ||
      Math.abs(dx) < Math.abs(dy) * SWIPE_AXIS_RATIO
    ) {
      return;
    }

    swipedRef.current = true;
    if (dx < 0 && hasNext) onNavigate(activeIndex + 1);
    else if (dx > 0 && hasPrev) onNavigate(activeIndex - 1);
  }

  const alt = item.alt?.trim() || item.caption?.trim() || title;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => {
        if (swipedRef.current) {
          swipedRef.current = false;
          return;
        }
        onClose();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Intrinsic width/height come from the static import; CSS caps the
          rendered box at 92vw × 88vh and object-contain keeps the aspect,
          so no JS viewport tracking is needed. */}
      <Image
        src={item.src}
        alt={alt}
        className="max-w-[92vw] max-h-[88vh] w-auto h-auto object-contain"
        loading="eager"
        fetchPriority="high"
        unoptimized
        onClick={(e) => e.stopPropagation()}
        onLoad={preloadNeighbors}
      />
    </div>
  );
}
