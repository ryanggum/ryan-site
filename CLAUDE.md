# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ryan Gumlia's personal site (ryangumlia.com) — a Next.js 16 App Router site with three sections: a landing page, a film-photography gallery ("rolls"/"parks"), and a writing/posts section.

## Prose is Ryan's, not Claude's

Never invent user-facing written content for this site. That means post titles,
subtitles, descriptions, `<title>`/OpenGraph/meta description text, captions,
alt text, headings, or body prose — anything a reader sees as Ryan's writing.

Wire up the structure and leave the words to Ryan: use the copy they provide
verbatim, or leave the field out entirely and say it needs text. An
omitted `description` is fine (it's optional on `Post`); a plausible-sounding
placeholder is not, because it reads as their voice and can ship unnoticed.

This does not restrict code-level writing: comments, commit messages, and
variable names are fine to write.

## Commands

```bash
npm run dev      # start dev server (Next.js, Turbopack by default)
npm run build     # production build (also runs next-sitemap via postbuild)
npm run start     # serve the production build
npm run lint      # eslint via eslint.config.mjs (next/core-web-vitals + next/typescript)
npm run format    # prettier --write . (printWidth 80, see .prettierrc)
```

There is no test suite configured. Type-check with `npx tsc --noEmit`.

## Architecture

### Two parallel content systems

The site has two independent, similarly-structured content systems that are easy to confuse:

- **Rolls / Parks** (`/parks`, `/parks/[slug]`): film photo albums. Metadata lives in `src/lib/rolls.ts` (exports `albums`, `albumSlugs`, `getAlbumMeta`). Each album's photos live in `src/app/assets/parks/<slug>/photos.ts`, which imports local `.jpg` files and exports a default `Photo[]`.
- **Posts** (`/posts`, `/posts/<slug>`): written pieces. Metadata lives in `src/lib/posts.ts` (exports `posts`, `getPostMeta`, `stripHtml`). Unlike parks, there's no dynamic `[slug]` route or generated params — each post is its own hand-authored route directory under `src/app/posts/<slug>/page.tsx`. Post photos are imported straight into `page.tsx` from `src/app/assets/posts/<slug>/` (no `photos.ts`; JMT's leftover one is unused).

Both metadata arrays carry an `i` (display index), and both list/detail pages group entries by year via the shared `groupByYear` helper (`src/lib/groupByYear.ts`) — `groupAlbumsByYear` in `src/app/parks/util/util.ts` wraps it for albums, `posts/page.tsx` calls it directly — sorted descending by year and, within a year, by roll number / date. When adding a new roll or post, add an entry to the corresponding array in `src/lib/rolls.ts` / `src/lib/posts.ts` — the list/detail pages and static params derive entirely from these arrays.

### Album photo loading

Both parks pages load an album's photos through `loadAlbumPhotos(slug)` in `src/app/parks/util/util.ts`, a dynamic import of `@/app/assets/parks/${slug}/photos`. No caching: both pages are statically generated, so each runs once per build. `hydrateAlbumsWithImages` (used by the `/parks` index) expects each album's photo array to contain **exactly 3** photos flagged `preview: true` (used for the index-page thumbnail grid) and throws, failing the build, if the count is off — which also catches an empty album. Keep this invariant in mind when editing a `photos.ts` file: every album needs exactly 3 `preview: true` entries.

### Shared display components

`src/app/components/display/DisplayGrid.tsx` (client) renders any `Photo[]` as a responsive image grid using `next/image` (thumbnails use `quality={100}` but are still resized/optimized), and opens `src/app/components/display/Lightbox.tsx` (client) as a fullscreen viewer on click. Both `/parks` (album previews + full album pages) and any post that shows photos reuse `DisplayGrid`. `Photo` and `AlbumMeta` types are defined once in `src/lib/types.ts`.

`DisplayGrid` accepts an exact `sizes` string; the parks pages pass one computed from their own padding/max-width/gaps (prefixed with `auto`), kept next to the layout classes it mirrors — update it if that padding changes. Without `sizes` it falls back to `auto` plus a viewport-per-column guess capped at `width`, which only errs larger (posts use this fallback).

`Lightbox` receives the whole `images` array plus an `activeIndex` and `onNavigate` callback from `DisplayGrid` (not a single resolved photo) — this is what lets `ArrowLeft`/`ArrowRight` and horizontal swipe step through the same photo set the grid was built from (3 previews on `/parks`, the full album on an album page) without wraparound at the ends. After the current photo loads it preloads the neighboring originals. It also locks background scroll while open, closes on `Escape` or a tap on the backdrop, sizes the image with CSS (`max-w`/`max-h`, no JS viewport tracking), moves DOM focus onto itself on mount (so the triggering thumbnail button doesn't retain a stray focus ring), keeps `Tab` from escaping into the page, returns focus to the thumbnail on close only when it was opened from the keyboard, and renders its `<Image>` with `unoptimized` so the full-resolution original file is what's displayed and what a "Save Image As" downloads (as opposed to Next's re-encoded webp/avif, which `DisplayGrid`'s thumbnails still use).

### Posts composition

Post pages compose from small building blocks in `src/app/posts/components/`: `PostShell` (page chrome + `PostHeader`), `Prose` (styled paragraph/heading wrapper using Tailwind `prose`), `DayHeader`/`DayBreak` (trip-report day dividers, used by the JMT and Hawaii trip reports), and `GridStack` (`ImageGridStack`, for image grids inline in prose, e.g. in the Hawaii post). `ImageGridStack` takes `rows: { images, width, columns?, ratio? }[]` (plus a stack-level `ratio`); `images` accepts bare static imports, which get the `"[photo]"` alt, or full `Photo` objects when one needs its own alt or caption. Each row is its own `DisplayGrid` with its own lightbox — intentional. Use `ratio="4/3"` for rows of phone shots so they aren't cropped to the default 3:2. All current posts (`oneself`, `walrus`, `revolver`, `hawaii`, `jmt`) are static server components that read their own metadata via `getPostMeta(slug)` from `src/lib/posts.ts`.

### Styling conventions

Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`, no separate config file — theme tokens are declared inline via `@theme`). Dark mode follows `prefers-color-scheme` (no manual toggle); pair `text-black dark:text-white` / `border-black dark:border-white` style utilities throughout rather than relying on the CSS variables directly. Responsive layouts consistently step through `sm: md: lg: xl:` breakpoints with increasing padding (`px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48` is the common page-shell pattern).

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`). `/parks/[slug]` is a dynamic route whose `generateStaticParams` comes from `albumSlugs` (`src/lib/rolls.ts`); posts have no dynamic route or generated params — each is its own directory (see above). Either way the site is fully statically generated at build time — there's no runtime data fetching.

### Image optimization cache

`next.config.ts` sets `images.minimumCacheTTL` to one year (vs. Next's 4h default) because photos are immutable once published; leave this as-is rather than "fixing" it back to the default. It also whitelists `images.qualities: [100]` (the only value `DisplayGrid` requests) — any `quality` prop passed to `next/image` elsewhere in the codebase must be in this allowlist or the build fails. Don't add other quality values to the allowlist without deliberately intending it: each additional value doubles the distinct width×format×quality variants Next has to generate and cache-write for every image, and this project's Vercel free-tier Image Optimization cache-write quota has been blown through by exactly that before.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
