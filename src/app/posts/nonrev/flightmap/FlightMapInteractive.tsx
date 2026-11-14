"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";
import { arcGeometry, distanceToQuadratic, type Point } from "./arcs";
import FlightPlane, {
  PLANE_PATH,
  dashTo,
  type MapMode,
  type SharedState,
} from "./FlightPlane";

export type ArcDatum = {
  seq: number;
  d: string;
  from: Point;
  to: Point;
  control: Point;
};

/** A flight's projected endpoints and fan slot (see RouteSegment). */
export type RouteDatum = {
  seq: number;
  from: Point;
  to: Point;
  fan: number;
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
// settings are multipliers, kept in integer tenths so stepping never drifts
// (1.2000000000000002x)
const SETTING_STEP = 2; // 0.2x
const SPEED_RANGE = { min: 2, max: 50 }; // 0.2x - 5x
const BOW_RANGE = { min: -30, max: 30 }; // negative bows to the other side; 0 is straight
const DEFAULT_BOW = 0;
const WIND_RANGE = { min: 0, max: 30 }; // 0 (calm) - 3x
const WIND_TURN_DEG = 45; // each click of the direction button, clockwise

// shared border color for the control strip and settings panel
const BOX = "border border-black/30 dark:border-white/30";
const DIVIDE_X = "divide-x divide-black/30 dark:divide-white/30";
const ARC_ICON_D = "M1 10 Q6 0 11 10";

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
  routes,
  airports,
  children,
}: {
  viewBoxWidth: number;
  viewBoxHeight: number;
  routes: RouteDatum[];
  airports: AirportDatum[];
  children: ReactNode; // server-rendered borders, painted under everything
}) {
  // see MapMode: plane drawing the arcs, or no plane with all/no arcs
  const [mode, setMode] = useState<MapMode>(DEFAULT_MODE);
  // live state read every frame by FlightPlane (see SharedState); the React
  // state here that mirrors parts of it is only for rendering
  const shared = useRef<SharedState>({
    mode: DEFAULT_MODE,
    pointer: null,
    hoveredArc: null,
    paused: false,
    step: 0,
    speed: 1,
    progress: null,
    arcPaths: new Map(),
    highlight: null,
  });
  // draw progress, reported by FlightPlane once per leg change (tracked in
  // every mode, so a switch is seamless): fully drawn arcs, plus the one
  // currently being drawn (if any)
  const [drawn, setDrawn] = useState<ReadonlySet<number>>(new Set());
  const [drawing, setDrawing] = useState<number | null>(null);
  const [activeArc, setActiveArc] = useState<number | null>(null);
  const [activeAirport, setActiveAirport] = useState<string | null>(null);
  // while the cursor is on the plane, it's the only thing highlighted
  const [planeCaught, setPlaneCaught] = useState(false);
  // seq of the flight the plane is on (null until the first frame, and
  // under reduced motion, which hides the plane's controls)
  const [current, setCurrent] = useState<number | null>(null);
  const canFly = current !== null;
  const [paused, setPaused] = useState(false);
  // settings dropdown: plane speed and arc height, both in tenths, and wind
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(10);
  const [bow, setBow] = useState(DEFAULT_BOW);
  // steady wind: strength in tenths, and direction as a count of clockwise
  // 45° turns from east (blowing toward). The count isn't wrapped, so the
  // arrow always turns forward instead of spinning back from 315° to 0°.
  const [windStrength, setWindStrength] = useState(0);
  const [windTurns, setWindTurns] = useState(0);

  // every consumer (paths, hover, highlight, plane) reads these, so a bow or
  // wind change reshapes drawn, in-progress and undrawn arcs alike
  const arcs: ArcDatum[] = useMemo(() => {
    // viewBox y points down, so a positive angle turns clockwise on screen
    const angle = (windTurns * WIND_TURN_DEG * Math.PI) / 180;
    const strength = windStrength / 10;
    const wind: Point = [
      Math.cos(angle) * strength,
      Math.sin(angle) * strength,
    ];
    return routes.map(({ seq, from, to, fan }) => ({
      seq,
      from,
      to,
      ...arcGeometry(from, to, fan, bow / 10, wind),
    }));
  }, [routes, bow, windStrength, windTurns]);

  // close the dropdown on Escape or a press anywhere outside the controls
  useEffect(() => {
    if (!settingsOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!settingsRef.current?.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  // stable: a ref and a state setter only
  const setHover = useCallback((seq: number | null) => {
    shared.current.hoveredArc = seq;
    setActiveArc(seq);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const ctm = e.currentTarget.getScreenCTM();
      if (!ctm) return;

      const { x, y } = new DOMPoint(e.clientX, e.clientY).matrixTransform(
        ctm.inverse(),
      );
      shared.current.pointer = [x, y];

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
      const progress = shared.current.progress;
      // only what's on screen can be hovered: with the plane, drawn arcs
      // whole, the in-progress one up to the plane, undrawn ones not at all
      for (const arc of mode === "none" ? [] : arcs) {
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
    shared.current.highlight = el;
    if (!el) return;
    growIn(el);
    const progress = shared.current.progress;
    if (
      shared.current.mode === "plane" &&
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
        shared.current.mode = "all";
        setMode("all");
      }
      // With the plane, the hovered arc is no longer drawn (the map blanked
      // under it, or a step back went past it): drop the hover, rather than
      // have it come back (and stop the plane) when that arc is redrawn under
      // a cursor the line hasn't reached. ("all" can hover undrawn arcs, so
      // it's left alone.)
      const hovered = shared.current.hoveredArc;
      if (
        shared.current.mode === "plane" &&
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
      const progress = shared.current.progress;
      const path = progress && shared.current.arcPaths.get(progress.seq);
      if (path) dashTo(path, progress.fraction);
    }
    // the hovered arc may not be on screen any more; the next pointer move
    // re-tests against the new mode's rules
    if (next !== "all") setHover(null);
    shared.current.mode = next;
    setMode(next);
  };

  const togglePaused = () => {
    shared.current.paused = !paused;
    setPaused(!paused);
  };

  const step = (by: number) => {
    shared.current.step += by;
  };

  const changeSpeed = (next: number) => {
    shared.current.speed = next / 10;
    setSpeed(next);
  };

  const handlePointerLeave = useCallback(() => {
    shared.current.pointer = null;
    setHover(null);
    setActiveAirport(null);
  }, [setHover]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={settingsRef}
        className="absolute top-0 left-0 z-10 flex flex-col items-start gap-1 text-xs text-black dark:text-white"
      >
        {/* fixed height, so the strip doesn't change height on a toggle */}
        <div className={`flex h-6 ${DIVIDE_X} ${BOX}`}>
          {canFly && (
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
            canFly && (
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
              <Line
                d={ARC_ICON_D}
                className={mode === "all" ? "" : "opacity-30"}
              />
            </ControlButton>
          )}
          <ControlButton
            label="Settings"
            pressed={settingsOpen}
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Line d="M1 3 H11 M1 6 H11 M1 9 H11" strokeWidth={1} />
            <Line d="M3 1.5 V4.5 M8 4.5 V7.5 M5 7.5 V10.5" />
          </ControlButton>
        </div>
        {settingsOpen && (
          <div
            className={`flex flex-col divide-y divide-black/30 dark:divide-white/30 ${BOX} bg-background`}
          >
            {canFly && (
              <Stepper
                label="Speed"
                icon={<path d="M1 2 L6 6 L1 10 Z M6 2 L11 6 L6 10 Z" />}
                value={speed}
                range={SPEED_RANGE}
                onChange={changeSpeed}
              />
            )}
            <Stepper
              label="Arc height"
              icon={<Line d={ARC_ICON_D} />}
              value={bow}
              range={BOW_RANGE}
              onChange={setBow}
            />
            <Stepper
              label="Wind"
              icon={
                <Line
                  d="M1.5 6 H10 M7 3 L10 6 L7 9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-150"
                  // rotates about the glyph's center (SVG transform-origin is
                  // in user units)
                  style={{
                    transform: `rotate(${windTurns * WIND_TURN_DEG}deg)`,
                    transformOrigin: "6px 6px",
                  }}
                />
              }
              iconLabel="Wind direction"
              onIconClick={() => setWindTurns(windTurns + 1)}
              value={windStrength}
              range={WIND_RANGE}
              onChange={setWindStrength}
            />
          </div>
        )}
      </div>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        // Fills its parent, which must have a definite height. The viewBox
        // plus the default preserveAspectRatio ("xMidYMid meet") scales the
        // drawing down to fit and centers it, so the map never overflows.
        // Only the hit-layer rect below takes pointer events.
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
              if (el) shared.current.arcPaths.set(arc.seq, el);
              else shared.current.arcPaths.delete(arc.seq);
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
          arcs={arcs}
          shared={shared}
          onCaughtChange={setPlaneCaught}
          onLegChange={handleLegChange}
        />
      </svg>
    </div>
  );
}

/** An unfilled, stroked icon path in currentColor (1.5 wide by default). */
function Line({ className = "", ...props }: SVGProps<SVGPathElement>) {
  return (
    <path
      strokeWidth={1.5}
      {...props}
      className={`fill-none stroke-current ${className}`}
    />
  );
}

/** One icon button in the control strip (glyph in currentColor). */
function ControlButton({
  label,
  pressed,
  viewBox = "0 0 12 12",
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean; // set for toggles
  viewBox?: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className="flex items-center justify-center px-2 disabled:opacity-30"
    >
      <svg viewBox={viewBox} className="size-3 fill-current" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

/**
 * An icon, then [−] value× [+], stepping a tenths value within range. With
 * `onIconClick`, the icon is a button too.
 */
function Stepper({
  label,
  icon,
  iconLabel,
  onIconClick,
  value,
  range,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  iconLabel?: string;
  onIconClick?: () => void;
  value: number;
  range: { min: number; max: number };
  onChange: (next: number) => void;
}) {
  return (
    <div role="group" aria-label={label} className={`flex h-6 ${DIVIDE_X}`}>
      {onIconClick ? (
        <ControlButton label={iconLabel ?? label} onClick={onIconClick}>
          {icon}
        </ControlButton>
      ) : (
        <span className="flex items-center px-2">
          <svg viewBox="0 0 12 12" className="size-3 fill-current" aria-hidden>
            {icon}
          </svg>
        </span>
      )}
      <ControlButton
        label="Decrease"
        disabled={value <= range.min}
        onClick={() => onChange(Math.max(range.min, value - SETTING_STEP))}
      >
        <Line d="M2 6 H10" />
      </ControlButton>
      <span className="flex items-center justify-center min-w-[6ch] tabular-nums">
        {(value / 10).toFixed(1)}×
      </span>
      <ControlButton
        label="Increase"
        disabled={value >= range.max}
        onClick={() => onChange(Math.min(range.max, value + SETTING_STEP))}
      >
        <Line d="M2 6 H10 M6 2 V10" />
      </ControlButton>
    </div>
  );
}
