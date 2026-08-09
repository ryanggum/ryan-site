// src/app/page.tsx
import Link from "next/link";
import { preload } from "react-dom";

const linkClass =
  "inline-flex w-fit items-center gap-1 rounded transition-colors hover:text-neutral-400 text-sm sm:text-base mb-0.5";

export default function Home() {
  preload("/bg-m.jpg", { as: "image", media: "(max-width: 767px)" });
  preload("/bg-d.jpg", { as: "image", media: "(min-width: 768px)" });

  return (
    <main
      className="
				relative min-h-dvh flex items-center justify-center px-4 sm:px-6 py-16
				bg-cover bg-center
				bg-[url('/bg-m.jpg')] md:bg-[url('/bg-d.jpg')]
			"
    >
      <div
        className={`
          text-left max-w-[60ch]
          -translate-y-32 sm:translate-y-0
          md:fixed md:top-[36%] md:left-[24%] md:-translate-y-1/2
          text-black md:text-white md:mix-blend-difference
          pointer-events-none select-none
        `}
      >
        <h1 className="text-4xl sm:text-5xl font-medium mb-4">
          ryan gumlia
        </h1>
        <p className="text-sm sm:text-base mb-2 break-words">
          I&apos;m a compliance analyst at D. E. Shaw & Co. in New York City.
          Previously, I studied humanities and computer science at Yale.
        </p>
        <div className="pl-4 md:pl-6">
          <nav className="flex flex-col items-start w-fit pointer-events-auto">
            <span className="text-sm sm:text-base">
              {"film "}
              <Link href="/parks" prefetch={false} className={linkClass}>
                <span>(rolls→)</span>
              </Link>
            </span>
            <span className="text-sm sm:text-base">
              {"films "}
              <a
                href="https://letterboxd.com/ryanggum/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <span>(letterboxd→)</span>
              </a>
            </span>
            <span className="text-sm sm:text-base">
              {"and writing "}
              <Link href="/posts" prefetch={false} className={linkClass}>
                <span>(posts→)</span>
              </Link>
            </span>
          </nav>
        </div>
      </div>
    </main>
  );
}
