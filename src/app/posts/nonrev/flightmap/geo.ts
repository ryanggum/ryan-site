import {
  geoAlbersUsa,
  geoPath,
  type GeoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
// us-atlas's states-10m.json (us-atlas is a devDependency only for this),
// checked in rather than imported from node_modules, and simplified since raw
// 10m detail is far finer than the viewBox and reads as jagged coastlines:
//   npx toposimplify -P 0.1 -f -o us-states-10m.json us-states-10m.json
// It's in .prettierignore, which would otherwise double its size.
import usStatesTopology from "./us-states-10m.json";

export const VIEWBOX_WIDTH = 960;
export const VIEWBOX_HEIGHT = 600;
const MARGIN = 20;

const topology = usStatesTopology as unknown as Topology;
const statesObject = topology.objects.states as GeometryCollection;
const nationObject = topology.objects.nation as GeometryCollection;

const nationOutline = feature(topology, nationObject);
const stateBorders = mesh(topology, statesObject, (a, b) => a !== b);

const projection = geoAlbersUsa().fitExtent(
  [
    [MARGIN, MARGIN],
    [VIEWBOX_WIDTH - MARGIN, VIEWBOX_HEIGHT - MARGIN],
  ],
  nationOutline as GeoPermissibleObjects,
);

const pathGenerator: GeoPath = geoPath(projection);

// state borders + national outline, drawn identically, so one path
export const bordersPath =
  (pathGenerator(stateBorders as GeoPermissibleObjects) ?? "") +
  (pathGenerator(nationOutline as GeoPermissibleObjects) ?? "");

// rounded so the emitted SVG is stable rather than full of 15-digit floats
const round = (n: number) => Math.round(n * 1000) / 1000;

export function project(lon: number, lat: number): [number, number] | null {
  const point = projection([lon, lat]);
  if (!point) return null;
  return [round(point[0]), round(point[1])];
}
