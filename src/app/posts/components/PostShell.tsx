// src/app/posts/components/PostShell.tsx

import Link from "next/link";
import { ReactNode } from "react";

const shell =
  "relative min-h-dvh box-border overflow-x-clip px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20";
const headerBox = "mb-6 flex flex-col items-center";
const backLink =
  "text-neutral-500 text-base sm:text-lg hover:text-neutral-700 transition-colors";

export default function PostShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className={shell}>
      <header className={headerBox}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2 text-black dark:text-white">
          {title}
        </h1>

        <div className="flex gap-4">
          <Link href="/posts" className={backLink}>
            ← posts
          </Link>
        </div>
      </header>

      <article className="prose dark:prose-invert max-w-[75ch] mx-auto [&_p]:my-3">
        {children}
      </article>
    </main>
  );
}
