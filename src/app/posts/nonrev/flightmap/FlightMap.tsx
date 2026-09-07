import {
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
  nationOutlinePath,
  stateBordersPath,
  project,
} from "./geo";
import { getAirportsUsed, buildRouteSegments } from "./routes";
import { arcPath } from "./arcs";

export default function FlightMap() {
  const airports = getAirportsUsed();
  const segments = buildRouteSegments();

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      // Fills its parent, which must have a definite height. The viewBox plus
      // the default preserveAspectRatio ("xMidYMid meet") scales the drawing
      // down to fit and centers it, so the map never overflows the viewport.
      className="w-full h-full"
      role="img"
      aria-label="Map of the United States showing personal flight history"
    >
      <path
        d={stateBordersPath}
        fill="none"
        className="stroke-black/30 dark:stroke-white/30"
        strokeWidth={0.5}
      />
      <path
        d={nationOutlinePath}
        fill="none"
        className="stroke-black/30 dark:stroke-white/30"
        strokeWidth={0.5}
      />
      {segments.map((segment) => {
        const from = project(segment.from.lon, segment.from.lat);
        const to = project(segment.to.lon, segment.to.lat);
        if (!from || !to) return null;
        return (
          <path
            key={segment.seq}
            d={arcPath(from, to, segment.i, segment.n)}
            fill="none"
            className="stroke-black dark:stroke-white"
            strokeWidth={1}
          />
        );
      })}
      {airports.map((airport) => {
        const point = project(airport.lon, airport.lat);
        if (!point) return null;
        const [x, y] = point;
        return (
          <circle
            key={airport.code}
            cx={x}
            cy={y}
            r={2.5}
            className="fill-black dark:fill-white"
          />
        );
      })}
    </svg>
  );
}
