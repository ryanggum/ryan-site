// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-dvh flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="text-left max-w-[65ch] md:absolute md:top-[25%] md:left-[25%] md:-translate-y-1/2">
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-medium mb-4 text-black dark:text-white">
          ryan gumlia
        </h1>

        <p className="text-sm sm:text-base mb-3 text-black dark:text-white transition-colors whitespace-normal break-words">
          I'm a senior Humanities major at Yale heading into L&amp;C at D. E. Shaw &amp; Co., broadly interested in law, linguistics, and tech.
        </p>

				<p className="text-sm sm:text-base mb-1 text-black dark:text-white transition-colors whitespace-normal break-words">
          Also, 35mm film:
        </p>

        {/* Indented nav restored */}
        <nav className="flex flex-col space-y-3 sm:space-y-2 pl-4 md:pl-6 text-neutral-500 dark:text-neutral-400 text-base sm:text-lg">
          <Link
            href="/parks"
            className="inline-flex w-fit items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded"
            aria-label=""
          >
            <span>parks</span>
            <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
