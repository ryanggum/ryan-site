"use client";

import { useEffect, useRef, type RefObject } from "react";
import { pointOnQuadratic, tangentOnQuadratic, type Point } from "./arcs";
import type { ArcDatum } from "./FlightMapInteractive";

const SPEED = 150; // viewBox units per second, constant across every leg
const LUT_SAMPLES = 64; // arc-length lookup resolution per leg
const REPOSITION_SPEED = 100; // viewBox units per second for non-flight hops, a bit slower than SPEED
const REPOSITION_MIN_MS = 1100; // floor so tiny hops (JFK<->LGA, SNA->LAX) are still visible
const GHOST_STROKE = 0.75; // outline width while repositioning (plane is unfilled then)
const WOBBLE_DEG = 15; // peak heading swing either side of the line while repositioning
const WOBBLE_PERIOD_MS = 370; // one full back-and-forth swing; same rhythm on short and long hops
const MAX_FRAME_MS = 100; // cap per-frame clock advance, so a backgrounded tab resumes instead of skipping legs
const PLANE_HIT_RADIUS = 7; // cursor within this of the plane's center catches it

// Top-down airplane silhouette, nose pointing +x, centered on the origin.
export const PLANE_PATH =
  "M6,0 L2,-1 L-1,-6 L-2.5,-6 L-1,-1 L-4,-1 L-5.5,-3 L-6.5,-3 L-5.5,0 L-6.5,3 L-5.5,3 L-4,1 L-1,1 L-2.5,6 L-1,6 L2,1 Z";

// "plane": the plane flies and draws each arc as it goes. Without the plane
// (its clock frozen until it comes back), "all" shows every arc and "none"
// just the airport dots.
export type MapMode = "plane" | "all" | "none";

/** Where the arc currently being drawn has got to, written every frame. */
export type DrawProgress = {
  seq: number;
  t: number; // Bézier parameter at the plane, for hit-testing the drawn part
  fraction: number; // arc-length fraction drawn, for the stroke dash
};

/**
 * Show only the first `fraction` (by length) of a path's stroke. The arc
 * paths are rendered with pathLength={1}, so dash units are fractions and no
 * per-frame getTotalLength() is needed.
 */
export function dashTo(path: SVGPathElement, fraction: number) {
  path.style.strokeDasharray = "1 1";
  path.style.strokeDashoffset = String(1 - fraction);
}

function clearDash(path: SVGPathElement) {
  path.style.removeProperty("stroke-dasharray");
  path.style.removeProperty("stroke-dashoffset");
}

type Leg = {
  // a real flight along its arc, or an off-the-record straight hop between
  // where one flight landed and where the next one departs
  kind: "flight" | "reposition";
  seq: number | null; // the flight's seq; null for a reposition hop
  flight: number; // index in seq order of this flight, or of the one a hop follows
  from: Point;
  control: Point;
  to: Point;
  lut: number[]; // cumulative length at each of LUT_SAMPLES + 1 evenly spaced t values
  start: number; // ms offset of takeoff within one loop
  duration: number; // ms in the air
};

function lengthTable(from: Point, control: Point, to: Point): number[] {
  const lut = [0];
  let prev = from;
  for (let s = 1; s <= LUT_SAMPLES; s++) {
    const p = pointOnQuadratic(from, control, to, s / LUT_SAMPLES);
    lut.push(lut[s - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    prev = p;
  }
  return lut;
}

function buildLegs(arcs: ArcDatum[]): {
  legs: Leg[];
  total: number;
  seqs: number[]; // flight seqs in order
  flightLegs: number[]; // leg index of each flight, in the same order
} {
  const ordered = [...arcs].sort((a, b) => a.seq - b.seq);
  const legs: Leg[] = [];
  let clock = 0;

  const flightLegs: number[] = [];

  const push = (
    kind: Leg["kind"],
    seq: number | null,
    flight: number,
    from: Point,
    control: Point,
    to: Point,
  ) => {
    const lut = lengthTable(from, control, to);
    const length = lut[LUT_SAMPLES];
    const duration =
      kind === "flight"
        ? (length / SPEED) * 1000
        : Math.max(REPOSITION_MIN_MS, (length / REPOSITION_SPEED) * 1000);
    legs.push({
      kind,
      seq,
      flight,
      from,
      control,
      to,
      lut,
      start: clock,
      duration,
    });
    clock += duration;
  };

  ordered.forEach(({ seq, from, control, to }, idx) => {
    flightLegs.push(legs.length);
    push("flight", seq, idx, from, control, to);
    // next departure (wrapping to seq 1 at the end of the loop) is somewhere
    // else: insert a straight hop. Control at the midpoint makes the
    // quadratic a straight line, so it reuses all the same machinery.
    const next = ordered[(idx + 1) % ordered.length].from;
    if (to[0] !== next[0] || to[1] !== next[1]) {
      const mid: Point = [(to[0] + next[0]) / 2, (to[1] + next[1]) / 2];
      push("reposition", null, idx, to, mid, next);
    }
  });

  return { legs, total: clock, seqs: ordered.map((a) => a.seq), flightLegs };
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Ease in and out, so the quick hop doesn't start and stop at full speed. */
function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

/**
 * Bézier t at which `fraction` of the leg's length has been covered, so the
 * plane moves at constant speed rather than bunching up near the endpoints.
 */
function tAtFraction(lut: number[], fraction: number): number {
  const target = fraction * lut[lut.length - 1];
  let lo = 0;
  let hi = lut.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lut[mid] < target) lo = mid;
    else hi = mid;
  }
  const span = lut[hi] - lut[lo] || 1;
  return (lo + (target - lut[lo]) / span) / (lut.length - 1);
}

/**
 * Flies a small plane along every flight in seq order, starting from a random
 * flight each page load, back to back with no pauses, looping forever. Gaps
 * (next flight departs somewhere other than where the last one landed) are a
 * quick straight hop with the plane drawn as an unfilled outline, so it
 * doesn't read as a real flight. Position is written straight to the DOM
 * each frame via a ref, so the animation never re-renders React. Hidden
 * entirely when the viewer prefers reduced motion.
 *
 * Catching it: every frame the plane checks its distance to the last known
 * cursor position (`pointerRef`, in viewBox units, kept by the parent's hit
 * layer) — per frame rather than on pointer move, since the plane can fly
 * into a still cursor. While caught it stops in place, and reports
 * catch/release (only on change) via `onCaughtChange` so the parent can
 * drop its arc/airport highlight and leave the plane as the one focus. It
 * also stops, without counting as caught, while flying along the arc the
 * cursor is hovering (`hoveredArcRef`, also kept by the parent).
 *
 * Transport controls (owned by the parent): `pausedRef` holds the plane
 * like a catch does, and `stepRef` is a pending jump of whole flights
 * (+1 / -1), consumed on the next frame by moving the clock to that flight's
 * takeoff. Stepping from a reposition hop counts from the flight it follows.
 *
 * Switching modes doesn't restart anything: outside "plane" mode the plane
 * is hidden and held, so its drawing resumes exactly where it was when it
 * comes back. The mode is read through the parent's `modeRef` so the effect
 * never re-runs on a switch.
 *
 * Drawing: the arcs start hidden (the parent hides any arc not in its
 * drawn/drawing state) and the plane reveals each flight's arc behind it
 * as it flies, via stroke-dasharray/dashoffset on the arc's own <path>
 * (`arcPathsRef`). Both the plane and the dash are driven by arc-length
 * fraction, so the drawn line ends right at the plane. Drawn arcs stay up
 * until the last one lands, then the map blanks and the next loop redraws
 * from empty. Which arcs are drawn is derived from position alone (every
 * flight from the random first one up to the current one, cyclically), so
 * stepping either way needs no extra bookkeeping. Progress, plus the current
 * flight's seq, is reported to the parent (`onLegChange`) only when a leg
 * changes; the in-progress arc's exact progress goes into
 * `drawProgressRef` every frame, so the parent can hover just its drawn
 * part, and a hover highlight on it is dashed to the plane as well
 * (`highlightPathRef`). Under reduced motion there's no plane to draw with,
 * so every arc is reported drawn.
 */
export default function FlightPlane({
  modeRef,
  arcs,
  pointerRef,
  hoveredArcRef,
  arcPathsRef,
  highlightPathRef,
  drawProgressRef,
  pausedRef,
  stepRef,
  onCaughtChange,
  onLegChange,
}: {
  modeRef: RefObject<MapMode>;
  arcs: ArcDatum[];
  pointerRef: RefObject<Point | null>;
  hoveredArcRef: RefObject<number | null>;
  arcPathsRef: RefObject<Map<number, SVGPathElement>>;
  // the parent's hover highlight copy (data-seq = its arc), dashed to match
  // while it's the arc being drawn
  highlightPathRef: RefObject<SVGPathElement | null>;
  drawProgressRef: RefObject<DrawProgress | null>;
  pausedRef: RefObject<boolean>;
  stepRef: RefObject<number>;
  onCaughtChange: (caught: boolean) => void;
  // current is the seq of the flight being flown (or just flown, on a hop);
  // null under reduced motion, where there's no plane to control
  onLegChange: (
    drawn: ReadonlySet<number>,
    drawing: number | null,
    current: number | null,
  ) => void;
}) {
  const ref = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const g = ref.current;
    const path = pathRef.current;
    if (!g || !path || arcs.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onLegChange(new Set(arcs.map((a) => a.seq)), null, null);
      return;
    }

    const { legs, total, seqs, flightLegs } = buildLegs(arcs);
    const n = seqs.length;
    // take off on a random flight each page load, then carry on in seq order;
    // it's also where each draw loop starts from empty
    const firstFlight = Math.floor(Math.random() * n);
    // loop clock, advanced by frame deltas (not derived from wall time) so it
    // can stand still while the plane is held and resume where it left off
    let elapsed = legs[flightLegs[firstFlight]].start;
    let ghost: boolean | null = null;
    let caught = false;
    // held = paused, caught, or flying along the arc the cursor is hovering;
    // decided from last frame's position, applied to this frame's clock
    let held = false;
    let lastNow: number | null = null;
    let drawingPath: SVGPathElement | null = null;
    let drawingSeq: number | null = null;
    let lastLegIdx = -1;
    const stopDrawing = () => {
      if (drawingPath) clearDash(drawingPath);
      drawingPath = null;
      drawingSeq = null;
      drawProgressRef.current = null;
    };
    // last leg whose takeoff has passed
    const legAt = (time: number) => {
      let idx = 0;
      for (let i = 0; i < legs.length && legs[i].start <= time; i++) idx = i;
      return idx;
    };
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(MAX_FRAME_MS, now - (lastNow ?? now));
      lastNow = now;
      let legIdx: number;
      const step = stepRef.current;
      if (step !== 0) {
        stepRef.current = 0;
        const target = mod(legs[legAt(elapsed)].flight + step, n);
        legIdx = flightLegs[target];
        elapsed = legs[legIdx].start;
      } else {
        if (!held) elapsed = (elapsed + dt) % total;
        legIdx = legAt(elapsed);
      }
      const leg = legs[legIdx];
      const legElapsed = elapsed - leg.start;
      const linear = Math.min(1, legElapsed / leg.duration);
      const isGhost = leg.kind === "reposition";
      const fraction = isGhost ? smoothstep(linear) : linear;
      const t = tAtFraction(leg.lut, fraction);

      // Draw bookkeeping runs in both modes, so switching mid-loop never
      // interrupts it: static just shows every arc whole, and switching back
      // to draw shows exactly what the plane has drawn so far.
      if (legIdx !== lastLegIdx) {
        lastLegIdx = legIdx;
        stopDrawing();
        // drawn: every flight from firstFlight up to this one (a hop counts
        // the flight it follows as done). Wrapping to 0 once all n are done
        // is the map blanking for the next loop.
        const count = mod(leg.flight - firstFlight + (isGhost ? 1 : 0), n);
        const drawn = new Set<number>();
        for (let k = 0; k < count; k++) drawn.add(seqs[(firstFlight + k) % n]);
        const path =
          leg.seq !== null ? arcPathsRef.current.get(leg.seq) : undefined;
        if (path) {
          drawingPath = path;
          drawingSeq = leg.seq;
        }
        onLegChange(drawn, drawingSeq, seqs[leg.flight]);
      }
      const flying = modeRef.current === "plane";
      if (drawingPath && drawingSeq !== null) {
        // "all" shows the in-progress arc whole
        if (flying) dashTo(drawingPath, fraction);
        else clearDash(drawingPath);
        drawProgressRef.current = { seq: drawingSeq, t, fraction };
      }
      // a hover highlight on the arc being drawn is cut off at the plane
      // too; on any other arc (or once this one is done) it's whole
      const highlight = highlightPathRef.current;
      if (highlight) {
        if (
          flying &&
          drawingSeq !== null &&
          highlight.dataset.seq === String(drawingSeq)
        ) {
          dashTo(highlight, fraction);
        } else {
          clearDash(highlight);
        }
      }
      const [x, y] = pointOnQuadratic(leg.from, leg.control, leg.to, t);
      const [dx, dy] = tangentOnQuadratic(leg.from, leg.control, leg.to, t);
      // ambling heading on hops: a sine swing, faded in and out by a
      // sin(pi * x) envelope so it leaves and arrives pointing straight
      const wobble = isGhost
        ? WOBBLE_DEG *
          Math.sin(Math.PI * linear) *
          Math.sin((2 * Math.PI * legElapsed) / WOBBLE_PERIOD_MS)
        : 0;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + wobble;

      const pointer = pointerRef.current;
      const isCaught =
        flying &&
        pointer !== null &&
        Math.hypot(pointer[0] - x, pointer[1] - y) <= PLANE_HIT_RADIUS;

      g.setAttribute("transform", `translate(${x},${y}) rotate(${angle})`);
      if (isCaught !== caught) {
        onCaughtChange(isCaught);
        caught = isCaught;
      }
      held =
        !flying ||
        pausedRef.current ||
        isCaught ||
        (leg.seq !== null && leg.seq === hoveredArcRef.current);
      if (isGhost !== ghost) {
        ghost = isGhost;
        // inline style beats the fill class in both light and dark mode
        path.style.fill = ghost ? "none" : "";
        path.setAttribute("stroke-width", String(ghost ? GHOST_STROKE : 0));
      }
      g.style.visibility = flying ? "visible" : "hidden";
      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frame);
      stopDrawing();
    };
  }, [
    arcs,
    modeRef,
    pointerRef,
    hoveredArcRef,
    arcPathsRef,
    highlightPathRef,
    drawProgressRef,
    pausedRef,
    stepRef,
    onCaughtChange,
    onLegChange,
  ]);

  return (
    <g ref={ref} style={{ visibility: "hidden" }}>
      <path
        ref={pathRef}
        d={PLANE_PATH}
        strokeWidth={0}
        strokeLinejoin="round"
        className="fill-[#041E42] stroke-[#041E42] dark:fill-white dark:stroke-white"
      />
    </g>
  );
}
