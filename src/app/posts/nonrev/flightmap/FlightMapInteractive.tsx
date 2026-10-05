"use client";

import { useCallback, useRef, useState } from "react";
import { distanceToQuadratic, type Point } from "./arcs";
import FlightPlane from "./FlightPlane";

export type ArcDatum = {
  seq: number;
  d: string;
  from: Point;
  to: Point;
  control: Point;
};

export type AirportDatum = {
  code: string;
  x: number;
  y: number;
};

const ARC_HIT_RADIUS = 6;
const AIRPORT_HIT_RADIUS = 4; // matches the enlarged dot, so "highlighted" means visibly on it
const GROW_MS = 150;

// Runs once per mounted highlight path (it's keyed by seq), animating the
// stroke from the base arc's width up to the highlight width.
function growIn(path: SVGPathElement | null) {
  path?.animate([{ strokeWidth: 1 }, { strokeWidth: 2.5 }], {
    duration: GROW_MS,
    easing: "ease",
  });
}

export default function FlightMapInteractive({
  viewBoxWidth,
  viewBoxHeight,
  arcs,
  airports,
}: {
  viewBoxWidth: number;
  viewBoxHeight: number;
  arcs: ArcDatum[];
  airports: AirportDatum[];
}) {
  const [activeArc, setActiveArc] = useState<number | null>(null);
  const [activeAirport, setActiveAirport] = useState<string | null>(null);
  // last cursor position in viewBox units, read every frame by FlightPlane
  const pointerRef = useRef<Point | null>(null);
  // while the cursor is on the plane, it's the only thing highlighted
  const [planeCaught, setPlaneCaught] = useState(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const ctm = e.currentTarget.getScreenCTM();
      if (!ctm) return;

      const { x, y } = new DOMPoint(e.clientX, e.clientY).matrixTransform(
        ctm.inverse(),
      );
      pointerRef.current = [x, y];

      let nearestAirport: string | null = null;
      let nearestAirportDist = Infinity;
      for (const airport of airports) {
        const dist = Math.hypot(airport.x - x, airport.y - y);
        if (dist < nearestAirportDist) {
          nearestAirportDist = dist;
          nearestAirport = airport.code;
        }
      }

      let nearestArc: number | null = null;
      let nearestArcDist = Infinity;
      for (const arc of arcs) {
        const dist = distanceToQuadratic([x, y], arc.from, arc.control, arc.to);
        if (dist < nearestArcDist) {
          nearestArcDist = dist;
          nearestArc = arc.seq;
        }
      }

      const airportHit = nearestAirportDist <= AIRPORT_HIT_RADIUS;
      const arcHit = nearestArcDist <= ARC_HIT_RADIUS;

      // Inside an airport's hit radius the airport always wins. Comparing
      // distances here instead (nearer target wins) never worked for dots:
      // every arc ends at its airport's center, so sliding along an arc into
      // a dot keeps the arc at ~0 distance and the arc stays highlighted
      // until the cursor reaches the dead center.
      if (airportHit) {
        setActiveAirport(nearestAirport);
        setActiveArc(null);
      } else if (arcHit) {
        setActiveArc(nearestArc);
        setActiveAirport(null);
      } else {
        setActiveArc(null);
        setActiveAirport(null);
      }
    },
    [arcs, airports],
  );

  const active = planeCaught
    ? undefined
    : arcs.find((arc) => arc.seq === activeArc);

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = null;
    setActiveArc(null);
    setActiveAirport(null);
  }, []);

  return (
    <>
      {/* Full-canvas hit layer: does its own nearest-curve/nearest-dot
          distance check on pointer move instead of relying on native stroke
          hitboxes, which are unreliable where arcs overlap or cross. */}
      <rect
        x={0}
        y={0}
        width={viewBoxWidth}
        height={viewBoxHeight}
        fill="transparent"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />
      {arcs.map((arc) => (
        <path
          key={arc.seq}
          d={arc.d}
          fill="none"
          stroke={`url(#arc-fade-${arc.seq})`}
          strokeWidth={1}
          className="pointer-events-none"
        />
      ))}
      {/* The highlight is a separate copy of the active arc drawn after all
          the others, so it always paints on top of its neighbors. Keyed by
          seq, so each hand-off mounts a fresh element: the new arc grows in
          (growIn) while the previous highlight disappears at once instead of
          lingering thick for 150ms, which made hand-offs between close arcs
          read as late. */}
      {active && (
        <path
          key={active.seq}
          ref={growIn}
          d={active.d}
          fill="none"
          stroke="#C8102E"
          strokeWidth={2.5}
          className="pointer-events-none"
        />
      )}
      {airports.map((airport) => (
        <circle
          key={airport.code}
          cx={airport.x}
          cy={airport.y}
          r={!planeCaught && activeAirport === airport.code ? 4 : 2.5}
          className="pointer-events-none fill-[#041E42] dark:fill-white transition-[r] duration-150"
        />
      ))}
      <FlightPlane
        arcs={arcs}
        pointerRef={pointerRef}
        onCaughtChange={setPlaneCaught}
      />
    </>
  );
}
