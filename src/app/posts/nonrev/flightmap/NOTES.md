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

- `FlightPlane.tsx` — `"use client"`, mounted at the end of
  `FlightMapInteractive` (so it paints above arcs and dots). Flies a small
  plane glyph along every flight in `seq` order, looping forever,
  taking off on a random leg each page load (not remembered). Constant
  speed (`SPEED` viewBox units/sec, via a per-leg arc-length lookup table
  inverted to Bézier `t`), nose rotated to the curve tangent. Legs run
  back to back with no pause at arrivals or at the loop restart. When the
  next flight departs from a different airport than the last one landed
  at (including the seq 26 -> seq 1 wrap), a `reposition` leg is
  inserted: a straight line (not an arc — arcs mean real flights), constant
  `REPOSITION_SPEED` (a bit slower than `SPEED`) with a
  `REPOSITION_MIN_MS` floor — the floor matters, since most gaps are tiny
  (JFK<->LGA is ~3 units, SNA->LAX ~11) and would otherwise flash by; only
  LGA->BOI (~640 units) is long enough to exceed it by much. Eased
  in/out, with the plane drawn as an unfilled outline (`GHOST_STROKE`) to
  read as "off the record", and its heading ambling back and forth
  (`WOBBLE_DEG` / `WOBBLE_PERIOD_MS` — time-based, so long hops get more
  swings rather than slower ones; enveloped so it leaves and arrives
  pointing straight). Nothing is drawn on the map for these hops. The random start only picks real flights. Position is
  written to the DOM via a ref inside `requestAnimationFrame`, so the
  animation never re-renders React (and doesn't fight the hover state).
  Not rendered (stays `visibility: hidden`) under
  `prefers-reduced-motion: reduce`. Doesn't highlight the arc it's on.
  **Catching the plane:** the parent's hit layer stores the last cursor
  position (viewBox units) in a shared `pointerRef`; `FlightPlane` checks
  it every animation frame — not on pointer move, since the plane can fly
  into a still cursor. Within `PLANE_HIT_RADIUS` (scaled with the plane,
  so the grown plane doesn't flicker off under a cursor on its wingtip) it
  turns Delta red (solid, or a red outline mid-hop) and eases up to
  `CAUGHT_SCALE`, easing back when released. Catch/release is reported
  only on change via `onCaughtChange`; the parent then suppresses its
  arc/airport highlight so the plane isn't lost against a red arc it's
  flying along.

## Current tuning

- Borders (state + nation, matched): Delta navy (`#041E42`) at 30%
  opacity in light mode, white at 30% in dark mode; `strokeWidth 0.5`.
- Arcs: `strokeWidth 1`, stroked with a per-arc `linearGradient`
  (`userSpaceOnUse`, oriented along the arc's own endpoints) instead of a
  flat color — opaque (`0.5`) at both ends, fading to `0.2` at the
  midpoint. Stop color is a fixed Delta red (`#C8102E`, Delta's widget
  mark red), same in light and dark mode rather than following the
  black/white theme convention used elsewhere on the site.
- Airport dots: Delta navy (`#041E42`) in light mode, white in dark
  mode — matches the borders, unlike the arcs which stay Delta red in
  both modes.
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
  (`distanceToQuadratic` in `arcs.ts`, distance to a 24-segment
  polyline of the actual Bézier curve — not the straight chord, and not
  just the sample points, which left un-hittable gaps on long arcs) and closest airport dot, an airport within
  `AIRPORT_HIT_RADIUS` (`4`, the enlarged dot's radius) always wins;
  otherwise the nearest arc within `ARC_HIT_RADIUS` (`6`); else nothing.
  (Airport priority replaced a "geometrically nearer wins" rule, which
  failed because every arc ends at its airport's center — sliding along an
  arc into a dot kept the arc at ~0 distance, so the arc stayed highlighted
  until the cursor hit dead center.) All arc paths and dots are `pointer-events-none` so only the
  rect's math decides what's "hovered" — correct even where several arcs
  cross the same pixel.
  The highlight itself is a separate solid-red copy of the active arc
  rendered after all the base arcs (keyed by `seq`, grown in with a
  Web Animations call), not a style change on the base arc. That keeps it
  painted on top of close neighbors, and on a hand-off the old highlight
  vanishes at once instead of shrinking back over 150ms — the lingering
  thick arc made switches between nearby arcs feel late. (Re-sorting the
  base arcs to put the active one last was rejected: React moves the node
  by reinserting it, which drops CSS transitions.)

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
- Border resolution: `us-states-10m.json` is `us-atlas`'s `states-10m.json`
  run through `topojson-simplify`'s `toposimplify` CLI (a devDependency),
  since raw 10m detail was way finer than the 960x600 viewBox can resolve
  and read as noisy jagged coastlines. One-off command, re-run if the
  source file is ever refreshed from `us-atlas`:
  `npx toposimplify -P 0.1 -f -o us-states-10m.json us-states-10m.json`
  (`-P` is a planar-area quantile — higher keeps more detail; `0.1` was
  chosen by eye against a few candidates; `-f` drops small islands left
  detached by simplification). The CLI preserves the file's existing
  TopoJSON quantization, so this is a pure drop-in replacement — same
  `objects`/`transform`, ~3,300 arc points instead of ~11,800, ~65KB
  instead of 114KB.
