// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BACKGROUNDS = [

  { url: "/bg2.jpg", tone: "light" }, // text should be black
  { url: "/bg3.jpg", tone: "light" },
	{ url: "/bg4.jpg", tone: "light" },
];

export default function Home() {
  const [bg, setBg] = useState(BACKGROUNDS[0]);

  useEffect(() => {
    setBg(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]);
  }, []);

  const textColor = bg.tone === "dark" ? "text-white" : "text-black";

  return (
    <main
      className={`relative min-h-dvh flex items-center justify-center px-4 sm:px-6 py-16 bg-cover bg-center`}
      style={{ backgroundImage: `url('${bg.url}')` }}
    >
<div
  className={`
    text-left max-w-[65ch]
    -translate-y-32 sm:translate-y-0
    md:absolute md:top-[25%] md:left-[25%] md:-translate-y-1/2
    ${textColor}
  `}
>
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-medium mb-4">
          ryan gumlia
        </h1>

        <p className="text-sm sm:text-base mb-3 transition-colors whitespace-normal break-words">
          I'm a senior Humanities major at Yale heading into L&amp;C at D. E. Shaw &amp; Co., broadly interested in law, linguistics, and tech.
        </p>

        <p className="text-sm sm:text-base mb-1 transition-colors whitespace-normal break-words">
          Also, 35mm film:
        </p>

<nav className={`flex flex-col space-y-3 sm:space-y-2 pl-4 md:pl-6 ${textColor}`}>

  <Link
    href="/parks"
    className={`
      inline-flex w-fit items-center gap-1 cursor-pointer
      transition-colors
      hover:text-neutral-500
      focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded
    `}
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
