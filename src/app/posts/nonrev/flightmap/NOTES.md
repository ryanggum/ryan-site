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
  borders and the arc-fade `<linearGradient>` defs, computes every arc's
  projected endpoints/control point and every airport's projected
  position, and hands those (plain numbers/strings, no functions) to
  `FlightMapInteractive` as props. Nothing in this file is interactive,
  so there is no `"use client"` here — that matters, because that
  boundary is what keeps `us-states-10m.json`, `d3-geo` and
  `topojson-client` (~132KB) out of the client bundle. Only the small
  hover-state child below crosses into the client.
  Mounted on `src/app/posts/nonrev/page.tsx`, inside the shared
  `PostShell` like every other post.
- `FlightMapInteractive.tsx` — `"use client"`. Renders the arc paths and
  airport dots and owns the hover state (`activeArc` / `activeAirport`).
  See "Hover enlarge" below for why this exists instead of CSS
  `:hover`.

## Current tuning

- Borders (state + nation, matched): `stroke-black/30` (dark:
  `white/30`), `strokeWidth 0.5`.
- Arcs: `strokeWidth 1`, stroked with a per-arc `linearGradient`
  (`userSpaceOnUse`, oriented along the arc's own endpoints) instead of a
  flat color — opaque (`0.5`) at both ends, fading to `0.2` at the
  midpoint. Endpoint color is `currentColor` set via a `text-black
  dark:text-white` class on each `<stop>` (gradients don't inherit
  `currentColor` from the element they're painting).
- `arcs.ts`: `BOW_RATIO = 0.09`, `FAN_GAP = 6`.
- Hover enlarge: arcs get a fixed stroke-width bump (`1` -> `2.5`) and
  airport dots grow (`r` `2.5` -> `4`) when active. Arcs deliberately use
  a fixed width bump rather than a `transform: scale()` — scaling grows
  a path's whole bounding box, so the effect was barely visible on short
  arcs and exaggerated on long ones (same % growth, very different pixel
  growth); a flat stroke-width delta reads the same on every arc
  regardless of length.
  This started as pure CSS (`:hover` + an invisible wide sibling path
  per arc to widen the too-thin 1px hit target) but broke down once
  arcs overlap or cross: native stroke hit-testing just picks whichever
  overlapping path is topmost in paint order, so nearby arcs would
  "steal" hover from each other with no way to hit the one you actually
  wanted. Replaced with real hit-testing in `FlightMapInteractive.tsx`:
  a single full-viewBox `<rect>` (`fill="transparent"`, only element
  with `pointer-events`) tracks the pointer via `onPointerMove`, converts
  the client coordinate to SVG user space with
  `getScreenCTM().inverse()`, and on every move finds the closest arc
  (`distanceToQuadratic` in `arcs.ts`, sampling the actual Bézier curve
  — not the straight chord) and closest airport dot, activating whichever
  is geometrically nearer (ties favor the airport) if it's within its hit
  radius (`ARC_HIT_RADIUS` / `AIRPORT_HIT_RADIUS`, both `6`), else
  nothing. All arc paths and dots are `pointer-events-none` so only the
  rect's math decides what's "hovered" — correct even where several arcs
  cross the same pixel.

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
- Filter by year, chronological animate-in — data model (`seq`,
  per-flight records rather than pre-aggregated counts) was kept
  flexible enough to support this later. (Hover-to-enlarge is done —
  see "Hover enlarge" above.)
- Border resolution is whatever `us-atlas`'s `states-10m.json` ships;
  no simplification step has been added (considered, decided not worth
  it for now).
