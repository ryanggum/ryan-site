"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { distanceToQuadratic, type Point } from "./arcs";
import FlightPlane, {
  dashTo,
  type DrawProgress,
  type MapMode,
} from "./FlightPlane";

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
const DEFAULT_MODE: MapMode = "draw";

// Runs once per mounted highlight path (it's keyed by seq), animating the
// stroke from the base arc's width up to the highlight width.
function growIn(path: SVGPathElement) {
  path.animate([{ strokeWidth: 1 }, { strokeWidth: 2.5 }], {
    duration: GROW_MS,
    easing: "ease",
  });
}

export default function FlightMapInteractive({
  viewBoxWidth,
  viewBoxHeight,
  arcs,
  airports,
  children,
}: {
  viewBoxWidth: number;
  viewBoxHeight: number;
  arcs: ArcDatum[];
  airports: AirportDatum[];
  children: ReactNode; // server-rendered borders, painted under everything
}) {
  // "static": every arc always shown. "draw": arcs start hidden and the
  // plane draws each one as it flies it; drawn arcs stay up until the whole
  // loop is drawn, then the map blanks and redraws.
  const [mode, setMode] = useState<MapMode>(DEFAULT_MODE);
  // mirror of mode for the stable callbacks below (written in toggleMode)
  const modeRef = useRef<MapMode>(DEFAULT_MODE);
  // draw progress, reported by FlightPlane once per leg change (tracked in
  // both modes, so a switch is seamless): fully drawn arcs, plus the one
  // currently being drawn (if any)
  const [drawn, setDrawn] = useState<ReadonlySet<number>>(new Set());
  const [drawing, setDrawing] = useState<number | null>(null);
  // arc <path> elements by seq, for FlightPlane to reveal imperatively
  const arcPathsRef = useRef(new Map<number, SVGPathElement>());
  // in-progress arc's progress, written by FlightPlane every frame
  const drawProgressRef = useRef<DrawProgress | null>(null);
  // the mounted hover highlight copy, which FlightPlane dashes in step with
  // the arc being drawn when that's the one highlighted
  const highlightPathRef = useRef<SVGPathElement | null>(null);
  const [activeArc, setActiveArc] = useState<number | null>(null);
  const [activeAirport, setActiveAirport] = useState<string | null>(null);
  // last cursor position in viewBox units, read every frame by FlightPlane
  const pointerRef = useRef<Point | null>(null);
  // seq of the hovered arc, mirrored from activeArc for FlightPlane to read
  // each frame (it stops while flying along the hovered arc)
  const hoveredArcRef = useRef<number | null>(null);
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
      const progress = drawProgressRef.current;
      for (const arc of arcs) {
        // in draw mode only what's on screen can be hovered: drawn arcs
        // whole, the in-progress one up to the plane, undrawn ones not at all
        let tMax = 1;
        if (mode === "draw" && !drawn.has(arc.seq)) {
          if (progress?.seq !== arc.seq) continue;
          tMax = progress.t;
        }
        const dist = distanceToQuadratic(
          [x, y],
          arc.from,
          arc.control,
          arc.to,
          tMax,
        );
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
      const hoveredArc = !airportHit && arcHit ? nearestArc : null;
      hoveredArcRef.current = hoveredArc;
      setActiveArc(hoveredArc);
      setActiveAirport(airportHit ? nearestAirport : null);
    },
    [arcs, airports, mode, drawn],
  );

  const active = planeCaught
    ? undefined
    : arcs.find((arc) => arc.seq === activeArc);

  // Stable (module-level growIn was too), so it runs once per mounted
  // highlight rather than on every render. If the highlight mounts on the
  // arc being drawn, dash it right away — waiting for FlightPlane's next
  // frame could paint the whole arc for a frame first.
  const highlightRef = useCallback((el: SVGPathElement | null) => {
    highlightPathRef.current = el;
    if (!el) return;
    growIn(el);
    const progress = drawProgressRef.current;
    if (
      modeRef.current === "draw" &&
      progress &&
      el.dataset.seq === String(progress.seq)
    ) {
      dashTo(el, progress.fraction);
    }
  }, []);

  const handleDrawChange = useCallback(
    (nextDrawn: ReadonlySet<number>, nextDrawing: number | null) => {
      setDrawn(nextDrawn);
      setDrawing(nextDrawing);
      // In draw mode, the map blanked under a hovered arc: drop the hover,
      // rather than have it come back (and stop the plane) when that arc is
      // redrawn under a cursor the line hasn't reached. Otherwise a hovered
      // arc is always in nextDrawn here, since finishing it is what changed
      // legs. (Static mode can hover undrawn arcs, so it's left alone.)
      const hovered = hoveredArcRef.current;
      if (
        modeRef.current === "draw" &&
        hovered !== null &&
        !nextDrawn.has(hovered)
      ) {
        hoveredArcRef.current = null;
        setActiveArc(null);
      }
    },
    [],
  );

  // Switching is continuous: the plane keeps flying and FlightPlane keeps
  // tracking the drawing in both modes, so static just shows every arc and
  // draw shows what's been drawn so far.
  const toggleMode = () => {
    const next = mode === "draw" ? "static" : "draw";
    if (next === "draw") {
      // Cut the in-progress arc off at the plane now, in the same commit
      // that reveals it, instead of on FlightPlane's next frame (which
      // could paint it whole for a frame first).
      const progress = drawProgressRef.current;
      const path = progress && arcPathsRef.current.get(progress.seq);
      if (path) dashTo(path, progress.fraction);
      // the hovered arc may not be drawn yet; the next pointer move
      // re-tests against draw mode's rules
      hoveredArcRef.current = null;
      setActiveArc(null);
    }
    modeRef.current = next;
    setMode(next);
  };

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = null;
    hoveredArcRef.current = null;
    setActiveArc(null);
    setActiveAirport(null);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* TODO: placeholder toggle (label is just the mode's code name) */}
      <button
        type="button"
        onClick={toggleMode}
        className="absolute top-0 left-0 z-10 border border-black/30 dark:border-white/30 px-2 py-1 text-xs text-black dark:text-white"
      >
        {mode}
      </button>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        // Fills its parent, which must have a definite height. The viewBox
        // plus the default preserveAspectRatio ("xMidYMid meet") scales the
        // drawing down to fit and centers it, so the map never overflows.
        className="w-full h-full"
        role="img"
        aria-label="Map of the United States showing personal flight history"
      >
        {children}
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
            ref={(el) => {
              if (el) arcPathsRef.current.set(arc.seq, el);
              else arcPathsRef.current.delete(arc.seq);
            }}
            d={arc.d}
            fill="none"
            stroke="#C8102E"
            strokeOpacity={0.5}
            strokeWidth={1}
            visibility={
              mode === "static" || drawn.has(arc.seq) || drawing === arc.seq
                ? "visible"
                : "hidden"
            }
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
            ref={highlightRef}
            data-seq={active.seq}
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
          mode={mode}
          arcs={arcs}
          pointerRef={pointerRef}
          hoveredArcRef={hoveredArcRef}
          arcPathsRef={arcPathsRef}
          highlightPathRef={highlightPathRef}
          drawProgressRef={drawProgressRef}
          onCaughtChange={setPlaneCaught}
          onDrawChange={handleDrawChange}
        />
      </svg>
    </div>
  );
}
