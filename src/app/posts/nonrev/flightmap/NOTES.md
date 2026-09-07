# Flight map — notes

A US map (state + national borders, no fill) with airport dots and curved
arcs showing flight history. Repeat flights on the same route render as a
tight fan of nested arcs instead of one thick line.

## Files

- `flights.ts` — raw flight list, one row per leg, `{ seq, from, to }`.
  `seq` stands in for a real date (order matters for fan indexing / future
  chronological animation; add a `date` field later if you want to sort by
  that instead).
- `airports.json` — IATA code -> `{ name, lat, lon }`.
- `routes.ts` — joins the two above. Groups flights by directed pair
  (`from-to`, so A->B and B->A are separate routes) and produces
  `RouteSegment[]`, each carrying its index `i` and the route's total `n`.
  Also exports `getAirportsUsed()` for the dot layer.
- `geo.ts` — the projection. `d3.geoAlbersUsa()` fit to a fixed
  `960x600` viewBox via `fitExtent`, using `us-states-10m.json` (a local
  copy of `us-atlas`'s state/nation TopoJSON — copied in rather than
  imported from `node_modules` for bundler reliability). Exports the
  precomputed border path strings and a `project(lon, lat)` function.
  `project()` rounds output to 3 decimals. This originally fixed a
  hydration mismatch (raw projection floats differ by a few ULPs between
  server and browser) — that can't happen now the map is a server
  component, but the rounding is kept so the emitted SVG is stable and
  diffable rather than full of 15-digit floats.
- `arcs.ts` — the curve math. Quadratic Bézier between two projected
  points, offset perpendicular to the chord. Two things this had to get
  right:
  - **Proportional bow.** The offset is `length * BOW_RATIO`, not a fixed
    pixel value — a fixed offset made short hops (e.g. LGA-HPN) look like
    tall loops while long ones (LAX-JFK) barely curved at all.
  - **Consistent bow side.** The perpendicular is derived from this
    flight's own direction, so A->B and B->A bow to opposite sides
    automatically and read as separate arcs.
    Sibling flights on the same route fan out symmetrically around that
    base bow using a fixed `FAN_GAP` (this one intentionally stays a flat
    pixel value, not proportional — it's about visually separating lines,
    not route geometry).
- `FlightMap.tsx` — the component. A **server** component: it renders
  borders, then arcs, then dots (SVG has no z-index; paint order is
  document order). Nothing here is interactive, so there is no `"use
client"` — that matters, because the boundary used to pull
  `us-states-10m.json`, `d3-geo` and `topojson-client` into the client
  bundle (~132KB) to draw markup that never changes. As a server
  component the whole map is computed at build time and ships as plain
  SVG. Keep it that way; if a future hover/filter feature needs state,
  put the interactive bit in its own small client child rather than
  marking this file `"use client"`.
  Mounted on `src/app/posts/nonrev/page.tsx`, inside the shared
  `PostShell` like every other post.

## Current tuning

- Borders (state + nation, matched): `stroke-black/30` (dark:
  `white/30`), `strokeWidth 0.5`.
- Arcs: fully opaque, `strokeWidth 1`.
- `arcs.ts`: `BOW_RATIO = 0.09`, `FAN_GAP = 6`.

## Decisions made along the way

- Flights stored as a typed TS array, not the CSV originally sketched —
  avoids needing a CSV loader Next.js doesn't ship with, and gets
  type-checking on airport codes for free.
- A React component, not a native Web Component — this only lives on
  one Next.js page, so there's no need for the shadow-DOM
  encapsulation/portability a custom element would buy.
- `us-atlas` is a devDependency, not a dependency: nothing imports it at
  runtime, it's just the provenance of the checked-in
  `us-states-10m.json` (`cp node_modules/us-atlas/states-10m.json .`).
  That file is in `.prettierignore` — `npm run format` would otherwise
  expand it from 114KB to 224KB.
- A->B and B->A are treated as distinct routes (affects both fan counts
  and the bow-direction trick above).

## Not done yet

- Dot sizing by visit count (currently uniform `r=2.5`).
- Airport labels with a white text-halo for legibility over dense arcs.
- Any interaction (hover, filter by year, chronological animate-in) —
  data model (`seq`, per-flight records rather than pre-aggregated
  counts) was kept flexible enough to support this later.
- Border resolution is whatever `us-atlas`'s `states-10m.json` ships;
  no simplification step has been added (considered, decided not worth
  it for now).
