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
const PLANE_HIT_RADIUS = 7; // cursor within this of the plane's center (times its current scale) catches it
const CAUGHT_SCALE = 1.6; // plane grows to this while caught
const SCALE_EASE_MS = 80; // time constant for easing toward / back from CAUGHT_SCALE
const CAUGHT_COLOR = "#C8102E"; // Delta red, same as a highlighted arc
const WOBBLE_PERIOD_MS = 370; // one full back-and-forth swing; same rhythm on short and long hops

// Top-down airplane silhouette, nose pointing +x, centered on the origin.
const PLANE_PATH =
  "M6,0 L2,-1 L-1,-6 L-2.5,-6 L-1,-1 L-4,-1 L-5.5,-3 L-6.5,-3 L-5.5,0 L-6.5,3 L-5.5,3 L-4,1 L-1,1 L-2.5,6 L-1,6 L2,1 Z";

type Leg = {
  // a real flight along its arc, or an off-the-record straight hop between
  // where one flight landed and where the next one departs
  kind: "flight" | "reposition";
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

  ordered.forEach(({ from, control, to }, idx) => {
    const lut = lengthTable(from, control, to);
    const duration = (lut[LUT_SAMPLES] / SPEED) * 1000;
    legs.push({
      kind: "flight",
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
 * into a still cursor. While caught it turns Delta red and grows; it reports
 * catch/release (only on change) via `onCaughtChange` so the parent can
 * drop its arc/airport highlight and leave the plane as the one focus.
 */
export default function FlightPlane({
  arcs,
  pointerRef,
  onCaughtChange,
}: {
  arcs: ArcDatum[];
  pointerRef: RefObject<Point | null>;
  onCaughtChange: (caught: boolean) => void;
}) {
  const ref = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const g = ref.current;
    const path = pathRef.current;
    if (!g || !path || arcs.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { legs, total } = buildLegs(arcs);
    // take off on a random flight each page load, then carry on in seq order
    const flightStarts = legs
      .filter((l) => l.kind === "flight")
      .map((l) => l.start);
    const offset =
      flightStarts[Math.floor(Math.random() * flightStarts.length)];
    let startTime: number | null = null;
    let ghost: boolean | null = null;
    let caught = false;
    let scale = 1;
    let lastNow: number | null = null;
    let frame = requestAnimationFrame(function tick(now) {
      startTime ??= now - offset;
      const dt = now - (lastNow ?? now);
      lastNow = now;
      const elapsed = (now - startTime) % total;

      // last leg whose takeoff has passed
      let leg = legs[0];
      for (const l of legs) {
        if (l.start > elapsed) break;
        leg = l;
      }
      const legElapsed = elapsed - leg.start;
      const linear = Math.min(1, legElapsed / leg.duration);
      const isGhost = leg.kind === "reposition";
      const fraction = isGhost ? smoothstep(linear) : linear;
      const t = tAtFraction(leg.lut, fraction);
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
        Math.hypot(pointer[0] - x, pointer[1] - y) <= PLANE_HIT_RADIUS * scale;
      // exponential ease toward the target scale, frame-rate independent
      scale +=
        ((isCaught ? CAUGHT_SCALE : 1) - scale) *
        (1 - Math.exp(-dt / SCALE_EASE_MS));

      g.setAttribute(
        "transform",
        `translate(${x},${y}) rotate(${angle}) scale(${scale})`,
      );
      if (isGhost !== ghost || isCaught !== caught) {
        if (isCaught !== caught) onCaughtChange(isCaught);
        ghost = isGhost;
        caught = isCaught;
        // inline style beats the fill/stroke classes in both light and dark
        // mode; a caught ghost is a red outline, a caught flight solid red
        path.style.fill = ghost ? "none" : caught ? CAUGHT_COLOR : "";
        path.style.stroke = caught ? CAUGHT_COLOR : "";
        path.setAttribute("stroke-width", String(ghost ? GHOST_STROKE : 0));
      }
      g.style.visibility = "visible";
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [arcs, pointerRef, onCaughtChange]);

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
