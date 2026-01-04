import DisplayGrid from "@/app/components/DisplayGrid";

type ImageArray = any[];

type ImageGridStackProps =
  | {
      images: ImageArray;
      width: number;
    }
  | {
      images: [ImageArray, ImageArray];
      width: [number, number];
    };

export function ImageGridStack({ images, width }: ImageGridStackProps) {
  const grids = Array.isArray(images[0]) ? images : [images];
  const widths = Array.isArray(width) ? width : [width];

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
          />
        </div>
      ))}
    </div>
  );
}

export function DayBreak() {
  return (
    <div className="flex justify-center">
      <p>* * *</p>
    </div>
  );
}
