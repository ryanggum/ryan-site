// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-dvh flex items-center justify-center md:block px-4 sm:px-6 py-16">
      <div className="text-center md:text-left md:absolute md:top-[25%] md:left-[25%] md:-translate-y-1/2 max-w-[65ch]">
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-medium mb-4 text-black dark:text-white">
          ryan gumlia
        </h1>

        <p className="inline-block whitespace-nowrap text-sm sm:text-base mb-4 text-black dark:text-white transition-colors">
          I'm a senior Humanities major at Yale heading into L&amp;C at D. E. Shaw &amp; Co., broadly interested in law, linguistics, and tech.
        </p>

        <nav className="flex flex-col space-y-3 sm:space-y-2 md:pl-4 text-neutral-500 dark:text-neutral-400 text-base sm:text-lg">
          <Link
            href="/parks"
            className="inline-flex w-fit items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded"
            aria-label="Open parks gallery"
          >
            <span>parks</span>
            <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
