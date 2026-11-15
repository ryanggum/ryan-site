// src/app/posts/components/GridStack.tsx
import DisplayGrid from "@/app/components/display/DisplayGrid";
import type { AspectRatio, Photo } from "@/lib/types";

export type GridRow = {
  images: Photo[];
  /** Max width of this row in px; it shrinks below that with the page. */
  width: number;
  /** Fixed column count; defaults to 1/2/3 by image count. */
  columns?: number;
  /** Overrides the stack-level `ratio` for this row. */
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
          images={row.images}
          width={row.width}
          columns={row.columns}
          ratio={row.ratio ?? ratio}
        />
      ))}
    </div>
  );
}
