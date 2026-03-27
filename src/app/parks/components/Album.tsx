// src/app/parks/components/Album.tsx (client)
"use client";

// import { useState } from "react";
import DisplayGrid from "../../components/DisplayGrid";
import type { Photo } from "@/lib/types";

const shell =
  "relative min-h-dvh box-border overflow-x-clip px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20";

function Header({ title }: { title: string }) {
  return (
    <header className="mb-3 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-3">
        {title}
      </h1>
    </header>
  );
}

// function ColumnButtons({
//   columns,
//   setColumns,
// }: {
//   columns: 1 | 3;
//   setColumns: (cols: 1 | 3) => void;
// }) {
//   const base =
//     "border border-black dark:border-white px-3 py-1 text-sm transition-colors";
//   const active = "text-black dark:text-white";
//   const inactive =
//     "text-neutral-400 dark:text-neutral-500 cursor-pointer hover:text-black dark:hover:text-white";

//   return (
//     <div className="mb-4 flex justify-end gap-2">
//       <button
//         type="button"
//         onClick={() => setColumns(1)}
//         disabled={columns === 1}
//         className={`${base} ${columns === 1 ? active : inactive}`}
//       >
//         1 Col
//       </button>

//       <button
//         type="button"
//         onClick={() => setColumns(3)}
//         disabled={columns === 3}
//         className={`${base} ${columns === 3 ? active : inactive}`}
//       >
//         3 Col
//       </button>
//     </div>
//   );
// }

export default function Album({
  title,
  images,
  missing,
}: {
  title: string;
  images: Photo[];
  missing?: "album";
}) {
  // const [columns, setColumns] = useState<1 | 3>(3);

  return (
    <main className={shell}>
      <Header title={title} />

      {!missing && (
        <>
          {/* <ColumnButtons columns={columns} setColumns={setColumns} /> */}
          <div className="mb-4 border-t border-black dark:border-white" />
        </>
      )}

      {missing ? (
        <div className="text-center text-neutral-500">No Album</div>
      ) : images.length ? (
        <DisplayGrid title={title} images={images} columns={3} />
      ) : (
        <div className="text-center text-neutral-500">No Images</div>
      )}
    </main>
  );
}
