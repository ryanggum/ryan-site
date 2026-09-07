import {
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
  nationOutlinePath,
  stateBordersPath,
  project,
} from "./geo";
import { getAirportsUsed, buildRouteSegments } from "./routes";
import { arcGeometry } from "./arcs";
import FlightMapInteractive, {
  type ArcDatum,
  type AirportDatum,
} from "./FlightMapInteractive";

export default function FlightMap() {
  const airports: AirportDatum[] = [];
  for (const airport of getAirportsUsed()) {
    const point = project(airport.lon, airport.lat);
    if (!point) continue;
    airports.push({ code: airport.code, x: point[0], y: point[1] });
  }

  const arcs: ArcDatum[] = [];
  for (const segment of buildRouteSegments()) {
    const from = project(segment.from.lon, segment.from.lat);
    const to = project(segment.to.lon, segment.to.lat);
    if (!from || !to) continue;
    const { d, control } = arcGeometry(from, to, segment.i, segment.n);
    arcs.push({ seq: segment.seq, d, from, to, control });
  }

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
        className="stroke-[#041E42]/30 dark:stroke-white/30"
        strokeWidth={0.5}
      />
      <path
        d={nationOutlinePath}
        fill="none"
        className="stroke-[#041E42]/30 dark:stroke-white/30"
        strokeWidth={0.5}
      />
      <defs>
        {arcs.map((arc) => (
          <linearGradient
            key={arc.seq}
            id={`arc-fade-${arc.seq}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.from[0]}
            y1={arc.from[1]}
            x2={arc.to[0]}
            y2={arc.to[1]}
          >
            <stop offset="0%" stopColor="#C8102E" stopOpacity={0.5} />
            <stop offset="50%" stopColor="#C8102E" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#C8102E" stopOpacity={0.5} />
          </linearGradient>
        ))}
      </defs>
      <FlightMapInteractive
        viewBoxWidth={VIEWBOX_WIDTH}
        viewBoxHeight={VIEWBOX_HEIGHT}
        arcs={arcs}
        airports={airports}
      />
    </svg>
  );
}
