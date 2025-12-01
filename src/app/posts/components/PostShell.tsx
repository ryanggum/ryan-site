// src/app/posts/components/PostShell.tsx

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { ReactNode } from "react";

const shell =
  "relative min-h-dvh box-border overflow-x-clip px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 py-10 sm:py-14 md:py-20";
const headerBox = "mb-6 flex flex-col items-center";
const backLink =
  "text-neutral-500 text-base sm:text-lg hover:text-neutral-700 transition-colors";

export default function PostShell({
  title,
  subtitle,
  image,
  children,
	visible,
}: {
  title: string;
  subtitle?: string; 
  image?: StaticImageData;
  children: ReactNode;
	visible?: boolean;
}) {
  return (
    <main className={shell}>
      <header className={headerBox}>
<h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-1 text-black dark:text-white">
  {title}
</h1>

{subtitle && (
  <p className="text-neutral-500 dark:text-neutral-400 text-lg sm:text-xl mb-2">
    {subtitle}
  </p>
)}

{visible !== false && (
  <div className="flex gap-4 mb-4">
    <Link href="/posts" className={backLink}>
      ←posts
    </Link>
  </div>
)}

        {image && (
          <Image
            src={image}
            alt={title}
            className="max-h-75 w-auto"
            priority
          />
        )}
      </header>

      <article className="prose dark:prose-invert max-w-[75ch] mx-auto [&_p]:my-3">
        {children}
      </article>
    </main>
  );
}
