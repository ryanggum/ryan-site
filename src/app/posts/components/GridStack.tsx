// src/app/posts/components/GridStack.tsx
import DisplayGrid from "@/app/components/display/DisplayGrid";
import type { AspectRatio, Photo } from "@/lib/types";

type ImageArray = Photo[];

type ScalarOrPair<T> = T | [T, T];

type ImageGridStackProps = {
  title: string;
  images: ImageArray | [ImageArray, ImageArray];
  width: ScalarOrPair<number>;
  columns?: ScalarOrPair<number>;
  // A single value applies to every grid in the stack; a pair sets each.
  ratio?: ScalarOrPair<AspectRatio>;
};

export function ImageGridStack({
  title,
  images,
  width,
  columns,
  ratio,
}: ImageGridStackProps) {
  const grids: ImageArray[] = Array.isArray(images[0])
    ? (images as [ImageArray, ImageArray])
    : [images as ImageArray];
  const widths = Array.isArray(width) ? width : [width];
  const columnsArr =
    columns !== undefined ? (Array.isArray(columns) ? columns : [columns]) : [];
  const ratios = Array.isArray(ratio) ? ratio : [ratio];

  return (
    <div className="flex flex-col items-center">
      {grids.map((imgSet, i) => (
        <div
          key={i}
          className={`flex justify-center w-full ${
            grids.length === 1
              ? "mt-4 mb-4"
              : i === 0
                ? "mt-4 mb-2"
                : "mt-1 mb-4"
          }`}
        >
          <div className="not-prose w-full flex justify-center">
            <DisplayGrid
              title={title}
              images={imgSet}
              width={widths[i] ?? widths[0]}
              columns={columnsArr[i]}
              ratio={ratios[i] ?? ratios[0]}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
