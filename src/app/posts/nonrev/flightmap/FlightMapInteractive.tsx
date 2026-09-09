"use client";

import { useCallback, useState } from "react";
import { distanceToQuadratic, type Point } from "./arcs";

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
const AIRPORT_HIT_RADIUS = 6;

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

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement;
      const ctm = e.currentTarget.getScreenCTM();
      if (!svg || !ctm) return;

      const screenPoint = svg.createSVGPoint();
      screenPoint.x = e.clientX;
      screenPoint.y = e.clientY;
      const { x, y } = screenPoint.matrixTransform(ctm.inverse());

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

      // Whichever is geometrically closer wins, so a cursor deep inside an
      // arc-only region never gets stolen by a farther-off airport dot (and
      // vice versa); ties favor the airport since it's the more precise target.
      if (airportHit && (!arcHit || nearestAirportDist <= nearestArcDist)) {
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

  const handlePointerLeave = useCallback(() => {
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
          stroke={
            activeArc === arc.seq ? "#C8102E" : `url(#arc-fade-${arc.seq})`
          }
          strokeWidth={activeArc === arc.seq ? 2.5 : 1}
          className="pointer-events-none transition-[stroke-width] duration-150"
        />
      ))}
      {airports.map((airport) => (
        <circle
          key={airport.code}
          cx={airport.x}
          cy={airport.y}
          r={activeAirport === airport.code ? 4 : 2.5}
          className="pointer-events-none fill-[#041E42] dark:fill-white transition-[r] duration-150"
        />
      ))}
    </>
  );
}
