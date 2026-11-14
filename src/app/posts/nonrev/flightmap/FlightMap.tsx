import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, bordersPath, project } from "./geo";
import { getAirportsUsed, buildRouteSegments } from "./routes";
import FlightMapInteractive, {
  type RouteDatum,
  type AirportDatum,
} from "./FlightMapInteractive";

export default function FlightMap() {
  const airports: AirportDatum[] = [];
  for (const airport of getAirportsUsed()) {
    const point = project(airport.lon, airport.lat);
    if (!point) continue;
    airports.push({ code: airport.code, x: point[0], y: point[1] });
  }

  // just projected endpoints + fan position: the curves themselves are
  // computed client-side, since the arc height control reshapes them
  const routes: RouteDatum[] = [];
  for (const { seq, fan, ...segment } of buildRouteSegments()) {
    const from = project(segment.from.lon, segment.from.lat);
    const to = project(segment.to.lon, segment.to.lat);
    if (!from || !to) continue;
    routes.push({ seq, from, to, fan });
  }

  // The <svg> itself lives in FlightMapInteractive (beside its HTML
  // controls); the borders are passed in as server-rendered children so
  // the projection code and TopoJSON still never reach the client.
  return (
    <FlightMapInteractive
      viewBoxWidth={VIEWBOX_WIDTH}
      viewBoxHeight={VIEWBOX_HEIGHT}
      routes={routes}
      airports={airports}
    >
      <path
        d={bordersPath}
        fill="none"
        className="stroke-[#041E42]/30 dark:stroke-white/30"
        strokeWidth={0.5}
      />
    </FlightMapInteractive>
  );
}
