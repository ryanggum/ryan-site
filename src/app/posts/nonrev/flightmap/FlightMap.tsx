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

  // The <svg> itself lives in FlightMapInteractive (it sits beside an HTML
  // button there); the borders are passed in as server-rendered children so
  // the projection code and TopoJSON still never reach the client.
  return (
    <FlightMapInteractive
      viewBoxWidth={VIEWBOX_WIDTH}
      viewBoxHeight={VIEWBOX_HEIGHT}
      arcs={arcs}
      airports={airports}
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
    </FlightMapInteractive>
  );
}
