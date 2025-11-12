// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BACKGROUNDS = [
  { url: "/bg-d.jpg", tone: "light" },
  { url: "/bg-m.jpg", tone: "light" },
];

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (isMobile === null) return <main className="min-h-dvh" />;

  const isDesktop = !isMobile;
  const bg = isMobile ? BACKGROUNDS[1] : BACKGROUNDS[0];

  return (
    <main
      className="relative min-h-dvh flex items-center justify-center px-4 sm:px-6 py-16 bg-cover bg-center"
      style={{ backgroundImage: `url('${bg.url}')` }}
    >
      {!isMobile && (
        <img
          src="/bg-d.jpg"
          alt=""
          className="hidden md:block absolute top-0 left-0 w-screen h-auto pointer-events-none select-none"
        />
      )}

      <div
				className={`
					text-left max-w-[65ch]
					-translate-y-32 sm:translate-y-0
					md:fixed md:top-[36%] md:left-[25%] md:-translate-y-1/2
					text-black md:text-white md:mix-blend-difference
					pointer-events-none select-none
				`}
      >
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-medium mb-4">
          ryan gumlia
        </h1>

        <p className="text-sm sm:text-base mb-3 break-words">
          I'm a senior Humanities major at Yale heading into L&amp;C at D. E. Shaw &amp; Co., broadly
          interested in law, linguistics, and tech.
        </p>

        <p className="text-sm sm:text-base mb-1 break-words">Also:</p>

        <div className="pl-4 md:pl-6">
          <nav className="flex flex-col items-start w-fit pointer-events-auto">
            <Link
              href="/parks"
              prefetch={false}
              className="inline-flex w-fit items-center gap-1 rounded transition-colors hover:text-neutral-400 text-sm sm:text-base mb-0.5"
            >
              <span>film (photos)→</span>
            </Link>

            {/* External link can be <a>; visual behavior unchanged */}
            <a
              href="https://letterboxd.com/ryanggum/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 rounded transition-colors hover:text-neutral-400 text-sm sm:text-base"
            >
              <span>films (letterboxd)→</span>
            </a>
          </nav>
        </div>
      </div>
    </main>
  );
}
