// src/app/posts/components/GridStack.tsx
import DisplayGrid from "@/app/components/DisplayGrid";

type ImageArray = any[];

type ScalarOrPair<T> = T | [T, T];

type ImageGridStackProps = {
  images: ImageArray | [ImageArray, ImageArray];
  width: ScalarOrPair<number>;
  columns?: ScalarOrPair<number>;
  square?: ScalarOrPair<boolean>;
};

export function ImageGridStack({
  images,
  width,
  columns,
  square,
}: ImageGridStackProps) {
  const grids = Array.isArray(images[0]) ? images : [images];
  const widths = Array.isArray(width) ? width : [width];
  const columnsArr =
    columns !== undefined ? (Array.isArray(columns) ? columns : [columns]) : [];
  const squareArr =
    square !== undefined ? (Array.isArray(square) ? square : [square]) : [];

  return (
    <div className="flex flex-col items-center">
      {grids.map((imgSet, i) => (
        <div
          key={i}
          className={`flex justify-center ${
            grids.length === 1
              ? "mt-4 mb-4"
              : i === 0
              ? "mt-4 mb-2"
              : "mt-1 mb-4"
          }`}
        >
          <DisplayGrid
            title="idk"
            images={imgSet}
            width={widths[i] ?? widths[0]}
            columns={columnsArr[i]}
            square={squareArr[i]}
          />
        </div>
      ))}
    </div>
  );
}
