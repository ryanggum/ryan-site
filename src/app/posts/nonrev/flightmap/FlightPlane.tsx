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
const PLANE_PATH =
  "M6,0 L2,-1 L-1,-6 L-2.5,-6 L-1,-1 L-4,-1 L-5.5,-3 L-6.5,-3 L-5.5,0 L-6.5,3 L-5.5,3 L-4,1 L-1,1 L-2.5,6 L-1,6 L2,1 Z";

export type MapMode = "static" | "draw";

/** Where the arc currently being drawn has got to, written every frame. */
export type DrawProgress = {
  seq: number;
  t: number; // Bézier parameter at the plane, for hit-testing the drawn part
  fraction: number; // arc-length fraction drawn, for the stroke dash
};

/** Show only the first `fraction` (by length) of a path's stroke. */
export function dashTo(path: SVGPathElement, fraction: number) {
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length} ${length}`;
  path.style.strokeDashoffset = String(length * (1 - fraction));
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

function samePoint(a: Point, b: Point): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function buildLegs(arcs: ArcDatum[]): { legs: Leg[]; total: number } {
  const ordered = [...arcs].sort((a, b) => a.seq - b.seq);
  const legs: Leg[] = [];
  let clock = 0;

  ordered.forEach(({ seq, from, control, to }, idx) => {
    const lut = lengthTable(from, control, to);
    const duration = (lut[LUT_SAMPLES] / SPEED) * 1000;
    legs.push({
      kind: "flight",
      seq,
      from,
      control,
      to,
      lut,
      start: clock,
      duration,
    });
    clock += duration;

    // next departure (wrapping to seq 1 at the end of the loop) is somewhere
    // else: insert a straight hop. Control at the midpoint makes the
    // quadratic a straight line, so it reuses all the same machinery.
    const next = ordered[(idx + 1) % ordered.length].from;
    if (!samePoint(to, next)) {
      const mid: Point = [(to[0] + next[0]) / 2, (to[1] + next[1]) / 2];
      const hopLut = lengthTable(to, mid, next);
      const hopDuration = Math.max(
        REPOSITION_MIN_MS,
        (hopLut[LUT_SAMPLES] / REPOSITION_SPEED) * 1000,
      );
      legs.push({
        kind: "reposition",
        seq: null,
        from: to,
        control: mid,
        to: next,
        lut: hopLut,
        start: clock,
        duration: hopDuration,
      });
      clock += hopDuration;
    }
  });

  return { legs, total: clock };
}

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
 * Switching modes doesn't restart anything: the drawing is tracked in both
 * modes (static just shows every arc whole on top of it), and `mode` is
 * read through a ref so the effect never re-runs on a switch.
 *
 * Draw mode: the arcs start hidden (the parent hides any arc not in its
 * drawn/drawing state) and the plane reveals each flight's arc behind it
 * as it flies, via stroke-dasharray/dashoffset on the arc's own <path>
 * (`arcPathsRef`). Both the plane and the dash are driven by arc-length
 * fraction, so the drawn line ends right at the plane. Drawn arcs stay up
 * until the last one lands, then the map blanks and the next loop redraws
 * from empty. Progress is reported to the parent (`onDrawChange`) only when
 * a leg changes; the in-progress arc's exact progress goes into
 * `drawProgressRef` every frame, so the parent can hover just its drawn
 * part, and a hover highlight on it is dashed to the plane as well
 * (`highlightPathRef`). Under reduced motion there's no plane to draw with,
 * so every arc is reported drawn.
 */
export default function FlightPlane({
  mode,
  arcs,
  pointerRef,
  hoveredArcRef,
  arcPathsRef,
  highlightPathRef,
  drawProgressRef,
  onCaughtChange,
  onDrawChange,
}: {
  mode: MapMode;
  arcs: ArcDatum[];
  pointerRef: RefObject<Point | null>;
  hoveredArcRef: RefObject<number | null>;
  arcPathsRef: RefObject<Map<number, SVGPathElement>>;
  // the parent's hover highlight copy (data-seq = its arc), dashed to match
  // while it's the arc being drawn
  highlightPathRef: RefObject<SVGPathElement | null>;
  drawProgressRef: RefObject<DrawProgress | null>;
  onCaughtChange: (caught: boolean) => void;
  onDrawChange: (drawn: ReadonlySet<number>, drawing: number | null) => void;
}) {
  const ref = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  // mode is read through a ref so a switch doesn't re-run the animation
  // effect, which would restart the plane
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const g = ref.current;
    const path = pathRef.current;
    if (!g || !path || arcs.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDrawChange(new Set(arcs.map((a) => a.seq)), null);
      return;
    }

    const { legs, total } = buildLegs(arcs);
    // take off on a random flight each page load, then carry on in seq order
    const flightStarts = legs
      .filter((l) => l.kind === "flight")
      .map((l) => l.start);
    const offset =
      flightStarts[Math.floor(Math.random() * flightStarts.length)];
    // loop clock, advanced by frame deltas (not derived from wall time) so it
    // can stand still while the plane is held and resume where it left off
    let elapsed = offset;
    let ghost: boolean | null = null;
    let caught = false;
    // held = caught, or flying along the arc the cursor is hovering;
    // decided from last frame's position, applied to this frame's clock
    let held = false;
    let lastNow: number | null = null;
    // draw bookkeeping (kept in both modes, see below)
    const drawn = new Set<number>();
    let drawingPath: SVGPathElement | null = null;
    let drawingSeq: number | null = null;
    let lastLegIdx = -1;
    const stopDrawing = () => {
      if (drawingPath) clearDash(drawingPath);
      drawingPath = null;
      drawingSeq = null;
      drawProgressRef.current = null;
    };
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(MAX_FRAME_MS, now - (lastNow ?? now));
      lastNow = now;
      if (!held) elapsed = (elapsed + dt) % total;

      // last leg whose takeoff has passed
      let legIdx = 0;
      for (let i = 0; i < legs.length; i++) {
        if (legs[i].start > elapsed) break;
        legIdx = i;
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
        // leaving a leg: whatever was being drawn is now fully drawn
        const prevSeq = lastLegIdx >= 0 ? legs[lastLegIdx].seq : null;
        if (drawingPath && prevSeq !== null) drawn.add(prevSeq);
        // the whole history is up: blank the map and draw it all again
        if (drawn.size === arcs.length) drawn.clear();
        stopDrawing();
        lastLegIdx = legIdx;
        const path =
          leg.seq !== null && !drawn.has(leg.seq)
            ? arcPathsRef.current.get(leg.seq)
            : undefined;
        if (path) {
          drawingPath = path;
          drawingSeq = leg.seq;
        }
        onDrawChange(new Set(drawn), drawingSeq);
      }
      const drawMode = modeRef.current === "draw";
      if (drawingPath && drawingSeq !== null) {
        // static mode shows the in-progress arc whole
        if (drawMode) dashTo(drawingPath, fraction);
        else clearDash(drawingPath);
        drawProgressRef.current = { seq: drawingSeq, t, fraction };
      }
      // a hover highlight on the arc being drawn is cut off at the plane
      // too; on any other arc (or once this one is done) it's whole
      const highlight = highlightPathRef.current;
      if (highlight) {
        if (
          drawMode &&
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
        pointer !== null &&
        Math.hypot(pointer[0] - x, pointer[1] - y) <= PLANE_HIT_RADIUS;

      g.setAttribute("transform", `translate(${x},${y}) rotate(${angle})`);
      if (isCaught !== caught) {
        onCaughtChange(isCaught);
        caught = isCaught;
      }
      held =
        isCaught || (leg.seq !== null && leg.seq === hoveredArcRef.current);
      if (isGhost !== ghost) {
        ghost = isGhost;
        // inline style beats the fill class in both light and dark mode
        path.style.fill = ghost ? "none" : "";
        path.setAttribute("stroke-width", String(ghost ? GHOST_STROKE : 0));
      }
      g.style.visibility = "visible";
      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frame);
      stopDrawing();
    };
  }, [
    arcs,
    pointerRef,
    hoveredArcRef,
    arcPathsRef,
    highlightPathRef,
    drawProgressRef,
    onCaughtChange,
    onDrawChange,
  ]);

  return (
    <g
      ref={ref}
      className="pointer-events-none"
      style={{ visibility: "hidden" }}
    >
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
