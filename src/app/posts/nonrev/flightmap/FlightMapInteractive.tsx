"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { distanceToQuadratic, type Point } from "./arcs";
import FlightPlane, {
  PLANE_PATH,
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
const DEFAULT_MODE: MapMode = "plane";

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
  // see MapMode: plane drawing the arcs, or no plane with all/no arcs
  const [mode, setMode] = useState<MapMode>(DEFAULT_MODE);
  // mirror of mode for the stable callbacks below (written in changeMode)
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
  // transport controls: seq of the flight the plane is on (null until the
  // first frame, and under reduced motion, which hides the controls),
  // paused (mirrored into a ref for FlightPlane's frame loop), and a pending
  // step of whole flights that FlightPlane consumes on its next frame
  const [current, setCurrent] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const stepRef = useRef(0);

  // stable: refs and state setters only
  const setHover = useCallback((seq: number | null) => {
    hoveredArcRef.current = seq;
    setActiveArc(seq);
  }, []);

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
        // only what's on screen can be hovered: with the plane, drawn arcs
        // whole, the in-progress one up to the plane, undrawn ones not at all
        if (mode === "none") break;
        let tMax = 1;
        if (mode === "plane" && !drawn.has(arc.seq)) {
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
      setHover(!airportHit && arcHit ? nearestArc : null);
      setActiveAirport(airportHit ? nearestAirport : null);
    },
    [arcs, airports, mode, drawn, setHover],
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
      modeRef.current === "plane" &&
      progress &&
      el.dataset.seq === String(progress.seq)
    ) {
      dashTo(el, progress.fraction);
    }
  }, []);

  const handleLegChange = useCallback(
    (
      nextDrawn: ReadonlySet<number>,
      nextDrawing: number | null,
      nextCurrent: number | null,
    ) => {
      setDrawn(nextDrawn);
      setDrawing(nextDrawing);
      setCurrent(nextCurrent);
      // reduced motion: no plane, so show the whole map instead
      if (nextCurrent === null) {
        modeRef.current = "all";
        setMode("all");
      }
      // With the plane, the hovered arc is no longer drawn (the map blanked
      // under it, or a step back went past it): drop the hover, rather than
      // have it come back (and stop the plane) when that arc is redrawn under
      // a cursor the line hasn't reached. ("all" can hover undrawn arcs, so
      // it's left alone.)
      const hovered = hoveredArcRef.current;
      if (
        modeRef.current === "plane" &&
        hovered !== null &&
        !nextDrawn.has(hovered)
      ) {
        setHover(null);
      }
    },
    [setHover],
  );

  // Switching is continuous: FlightPlane holds the plane (and its drawing)
  // while it's off, so it comes back exactly where it was.
  const changeMode = (next: MapMode) => {
    if (next === "plane") {
      // Cut the in-progress arc off at the plane now, in the same commit
      // that reveals it, instead of on FlightPlane's next frame (which
      // could paint it whole for a frame first).
      const progress = drawProgressRef.current;
      const path = progress && arcPathsRef.current.get(progress.seq);
      if (path) dashTo(path, progress.fraction);
    }
    // the hovered arc may not be on screen any more; the next pointer move
    // re-tests against the new mode's rules
    if (next !== "all") setHover(null);
    modeRef.current = next;
    setMode(next);
  };

  const togglePaused = () => {
    pausedRef.current = !paused;
    setPaused(!paused);
  };

  const step = (by: number) => {
    stepRef.current += by;
  };

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = null;
    setHover(null);
    setActiveAirport(null);
  }, [setHover]);

  return (
    <div className="relative w-full h-full">
      {/* fixed height, so the strip doesn't change height on a toggle */}
      <div className="absolute top-0 left-0 z-10 flex h-6 divide-x divide-black/30 dark:divide-white/30 border border-black/30 dark:border-white/30 text-xs text-black dark:text-white">
        {current !== null && (
          <ControlButton
            label="Plane"
            pressed={mode === "plane"}
            viewBox="-7 -7 14 14"
            onClick={() => changeMode(mode === "plane" ? "none" : "plane")}
          >
            <path
              d={PLANE_PATH}
              strokeWidth={1}
              strokeLinejoin="round"
              className={mode === "plane" ? "" : "fill-none stroke-current"}
            />
          </ControlButton>
        )}
        {mode === "plane" ? (
          current !== null && (
            <>
              <ControlButton label="Previous" onClick={() => step(-1)}>
                <path d="M2 2 H3.5 V10 H2 Z M10 2 L4 6 L10 10 Z" />
              </ControlButton>
              {/* the counter doubles as play/pause; dimmed while paused */}
              <button
                type="button"
                onClick={togglePaused}
                aria-label={paused ? "Play" : "Pause"}
                className={`px-2 min-w-[3.5ch] tabular-nums ${paused ? "opacity-40" : ""}`}
              >
                {current}
              </button>
              <ControlButton label="Next" onClick={() => step(1)}>
                <path d="M10 2 H8.5 V10 H10 Z M2 2 L8 6 L2 10 Z" />
              </ControlButton>
            </>
          )
        ) : (
          <ControlButton
            label="Flight paths"
            pressed={mode === "all"}
            onClick={() => changeMode(mode === "all" ? "none" : "all")}
          >
            <path
              d="M1 10 Q6 0 11 10"
              strokeWidth={1.5}
              className={`fill-none stroke-current ${mode === "all" ? "" : "opacity-30"}`}
            />
          </ControlButton>
        )}
      </div>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        // Fills its parent, which must have a definite height. The viewBox
        // plus the default preserveAspectRatio ("xMidYMid meet") scales the
        // drawing down to fit and centers it, so the map never overflows.
        // only the hit-layer rect below takes pointer events
        className="w-full h-full pointer-events-none"
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
          className="pointer-events-auto"
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
            pathLength={1} // dash units are fractions, see dashTo
            fill="none"
            stroke="#C8102E"
            strokeOpacity={0.5}
            strokeWidth={1}
            visibility={
              mode === "all" ||
              (mode === "plane" && (drawn.has(arc.seq) || drawing === arc.seq))
                ? "visible"
                : "hidden"
            }
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
            pathLength={1}
            fill="none"
            stroke="#C8102E"
            strokeWidth={2.5}
          />
        )}
        {airports.map((airport) => (
          <circle
            key={airport.code}
            cx={airport.x}
            cy={airport.y}
            r={!planeCaught && activeAirport === airport.code ? 4 : 2.5}
            className="fill-[#041E42] dark:fill-white transition-[r] duration-150"
          />
        ))}
        <FlightPlane
          modeRef={modeRef}
          arcs={arcs}
          pointerRef={pointerRef}
          hoveredArcRef={hoveredArcRef}
          arcPathsRef={arcPathsRef}
          highlightPathRef={highlightPathRef}
          drawProgressRef={drawProgressRef}
          pausedRef={pausedRef}
          stepRef={stepRef}
          onCaughtChange={setPlaneCaught}
          onLegChange={handleLegChange}
        />
      </svg>
    </div>
  );
}

/** One icon button in the control strip (glyph in currentColor). */
function ControlButton({
  label,
  pressed,
  viewBox = "0 0 12 12",
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean; // set for toggles
  viewBox?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="flex items-center justify-center px-2"
    >
      <svg viewBox={viewBox} className="size-3 fill-current" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
