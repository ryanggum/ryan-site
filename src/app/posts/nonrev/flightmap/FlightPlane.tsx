"use client";

import { useEffect, useRef } from "react";
import { pointOnQuadratic, tangentOnQuadratic, type Point } from "./arcs";
import type { ArcDatum } from "./FlightMapInteractive";

const SPEED = 150; // viewBox units per second, constant across every leg
const LUT_SAMPLES = 64; // arc-length lookup resolution per leg

// Top-down airplane silhouette, nose pointing +x, centered on the origin.
const PLANE_PATH =
  "M6,0 L2,-1 L-1,-6 L-2.5,-6 L-1,-1 L-4,-1 L-5.5,-3 L-6.5,-3 L-5.5,0 L-6.5,3 L-5.5,3 L-4,1 L-1,1 L-2.5,6 L-1,6 L2,1 Z";

type Leg = {
  from: Point;
  control: Point;
  to: Point;
  lut: number[]; // cumulative length at each of LUT_SAMPLES + 1 evenly spaced t values
  start: number; // ms offset of takeoff within one loop
  duration: number; // ms in the air
};

function buildLegs(arcs: ArcDatum[]): { legs: Leg[]; total: number } {
  const ordered = [...arcs].sort((a, b) => a.seq - b.seq);
  const legs: Leg[] = [];
  let clock = 0;

  for (const { from, control, to } of ordered) {
    const lut = [0];
    let prev = from;
    for (let s = 1; s <= LUT_SAMPLES; s++) {
      const p = pointOnQuadratic(from, control, to, s / LUT_SAMPLES);
      lut.push(lut[s - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
      prev = p;
    }
    const duration = (lut[LUT_SAMPLES] / SPEED) * 1000;
    legs.push({ from, control, to, lut, start: clock, duration });
    clock += duration;
  }

  return { legs, total: clock };
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
 * leg each page load, back to back with no pauses, looping forever. Gaps
 * (next leg departs somewhere other than where the last one landed) are an
 * instant jump. Position is written straight to the DOM each frame via a
 * ref, so the animation never re-renders React. Hidden entirely when the
 * viewer prefers reduced motion.
 */
export default function FlightPlane({ arcs }: { arcs: ArcDatum[] }) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = ref.current;
    if (!g || arcs.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { legs, total } = buildLegs(arcs);
    // take off on a random leg each page load, then carry on in seq order
    const offset = legs[Math.floor(Math.random() * legs.length)].start;
    let startTime: number | null = null;
    let frame = requestAnimationFrame(function tick(now) {
      startTime ??= now - offset;
      const elapsed = (now - startTime) % total;

      // last leg whose takeoff has passed
      let leg = legs[0];
      for (const l of legs) {
        if (l.start > elapsed) break;
        leg = l;
      }
      const fraction = Math.min(1, (elapsed - leg.start) / leg.duration);
      const t = tAtFraction(leg.lut, fraction);
      const [x, y] = pointOnQuadratic(leg.from, leg.control, leg.to, t);
      const [dx, dy] = tangentOnQuadratic(leg.from, leg.control, leg.to, t);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      g.setAttribute("transform", `translate(${x},${y}) rotate(${angle})`);
      g.style.visibility = "visible";
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [arcs]);

  return (
    <g
      ref={ref}
      className="pointer-events-none"
      style={{ visibility: "hidden" }}
    >
      <path d={PLANE_PATH} className="fill-[#041E42] dark:fill-white" />
    </g>
  );
}
