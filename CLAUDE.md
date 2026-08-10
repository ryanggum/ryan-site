# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ryan Gumlia's personal site (ryangumlia.com) — a Next.js 16 App Router site with three sections: a landing page, a film-photography gallery ("rolls"/"parks"), and a writing/posts section.

## Commands

```bash
npm run dev      # start dev server (Next.js, Turbopack by default)
npm run build     # production build (also runs next-sitemap via postbuild)
npm run start     # serve the production build
npm run lint      # eslint via eslint.config.mjs (next/core-web-vitals + next/typescript)
```

There is no test suite configured. Type-check with `npx tsc --noEmit`.

## Architecture

### Two parallel content systems

The site has two independent, similarly-structured content systems that are easy to confuse:

- **Rolls / Parks** (`/parks`, `/parks/[slug]`): film photo albums. Metadata lives in `src/lib/rolls.ts` (exports `albums`, `albumSlugs`, `getAlbumMeta`). Each album's photos live in `src/app/assets/parks/<slug>/photos.ts`, which imports local `.jpg` files and exports a default `Photo[]`.
- **Posts** (`/posts`, `/posts/[slug]`): written pieces. Metadata lives in `src/lib/posts.ts` (exports `posts`, `getPostMeta`, `stripHtml`). Each post is its own route directory under `src/app/posts/<slug>/page.tsx`; some posts have client content components (e.g. `posts/walrus/WalrusContent.tsx`) or their own `photos.ts`.

Both metadata arrays carry an `i` (display index), and both list/detail pages group entries by year via the shared `groupByYear` helper (`src/lib/groupByYear.ts`) — `groupAlbumsByYear` in `src/app/parks/util/util.tsx` wraps it for albums, `posts/page.tsx` calls it directly — sorted descending by year and, within a year, by roll number / date. When adding a new roll or post, add an entry to the corresponding array in `src/lib/rolls.ts` / `src/lib/posts.ts` — the list/detail pages and static params derive entirely from these arrays.

### Album photo loading

`src/app/parks/[slug]/page.tsx` dynamically imports `@/app/assets/parks/${slug}/photos` per-request. `src/app/parks/util/util.tsx` (`hydrateAlbumsWithImages`, used by the `/parks` index) does the same dynamic import but memoizes results in a module-level `Map` (`albumModuleCache`) for the life of the server process, and expects each album's photo array to contain **exactly 3** photos flagged `preview: true` (used for the index-page thumbnail grid) — `getPreviewPhotos` throws if the count is off, and a dev-only check throws if an album has zero photos. Keep both invariants in mind when editing a `photos.ts` file: every album needs exactly 3 `preview: true` entries.

### Shared display components

`src/app/components/display/DisplayGrid.tsx` (client) renders any `Photo[]` as a responsive image grid using `next/image` (thumbnails use `quality={100}` but are still resized/optimized), and opens `src/app/components/display/light/LightBox.tsx` (client) as a fullscreen viewer on click. Both `/parks` (album previews + full album pages) and any post that shows photos reuse `DisplayGrid`. `Photo` and `AlbumMeta` types are defined once in `src/lib/types.ts`.

`Lightbox` receives the whole `images` array plus an `activeIndex` and `onNavigate` callback from `DisplayGrid` (not a single resolved photo) — this is what lets `ArrowLeft`/`ArrowRight` step through the same photo set the grid was built from (3 previews on `/parks`, the full album on an album page) without wraparound at the ends. It also locks background scroll while open, closes on `Escape`, moves DOM focus onto itself on mount (so the triggering thumbnail button doesn't retain a stray focus ring), and renders its `<Image>` with `unoptimized` so the full-resolution original file is what's displayed and what a "Save Image As" downloads (as opposed to Next's re-encoded webp/avif, which `DisplayGrid`'s thumbnails still use).

### Posts composition

Post pages compose from small building blocks in `src/app/posts/components/`: `PostShell` (page chrome + `PostHeader`), `Prose` (styled paragraph/heading wrapper using Tailwind `prose`), `DayHeader`/`DayBreak` (trip-report day dividers, used by the JMT trip report), `Footnote`, `GridStack` (image grids inline in prose), and `ModeSwitcher` (a client toggle between "Standard" and alternate "DZ" content modes, e.g. used in the `revolver` post). Most posts are static server components that read their own metadata via `getPostMeta(slug)` from `src/lib/posts.ts`; a post needing interactivity (state, toggling) delegates its body to a co-located client component (see `walrus/page.tsx` → `walrus/WalrusContent.tsx`).

### Styling conventions

Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`, no separate config file — theme tokens are declared inline via `@theme`). Dark mode follows `prefers-color-scheme` (no manual toggle); pair `text-black dark:text-white` / `border-black dark:border-white` style utilities throughout rather than relying on the CSS variables directly. Responsive layouts consistently step through `sm: md: lg: xl:` breakpoints with increasing padding (`px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48` is the common page-shell pattern).

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`). Static params for both `/parks/[slug]` and post routes are generated from the `lib` metadata arrays (`albumSlugs`, `postSlugs`), so the site is fully statically generated at build time — there's no runtime data fetching.
