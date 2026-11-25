// src/app/posts/components/GridStack.tsx
import type { StaticImageData } from "next/image";
import DisplayGrid from "@/app/components/display/DisplayGrid";
import type { AspectRatio, Photo, Video } from "@/lib/types";

// The alt every post photo has used so far; applied to bare image imports.
const DEFAULT_ALT = "[photo]";

/**
 * A row entry is either a bare static import (`import stars from "…jpg"`),
 * which gets DEFAULT_ALT, or a full Photo when it needs its own alt or a
 * caption. StaticImageData's `src` is a URL string; Photo's is an object.
 */
export type PhotoInput = Photo | StaticImageData;

function toPhoto(input: PhotoInput): Photo {
  return typeof input.src === "string"
    ? { src: input as StaticImageData, alt: DEFAULT_ALT }
    : (input as Photo);
}

// A row is all photos or all clips, never mixed (same rule as DisplayGrid).
export type GridRow = (
  { images: PhotoInput[]; videos?: never } | { videos: Video[]; images?: never }
) & {
  /** Max width of this row in px; it shrinks below that with the page. */
  width: number;
  /** Fixed column count; defaults to 1/2/3 by image count. */
  columns?: number;
  /**
   * Overrides the stack-level `ratio` for this row. Clip rows ignore the
   * stack-level ratio and keep each clip's own shape unless set here.
   */
  ratio?: AspectRatio;
};

/**
 * One or more centered photo grids stacked inline in a post. Each row is its
 * own DisplayGrid, so each opens its own lightbox (intentional).
 */
export function ImageGridStack({
  title,
  rows,
  ratio,
}: {
  title: string;
  rows: GridRow[];
  /** Thumbnail shape for every row that doesn't set its own. */
  ratio?: AspectRatio;
}) {
  return (
    <div className="not-prose my-4 flex flex-col items-center gap-3">
      {rows.map((row, i) => (
        <DisplayGrid
          key={i}
          title={title}
          {...(row.images
            ? { images: row.images.map(toPhoto), ratio: row.ratio ?? ratio }
            : { videos: row.videos, ratio: row.ratio })}
          width={row.width}
          columns={row.columns}
        />
      ))}
    </div>
  );
}
