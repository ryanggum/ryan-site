import {
  geoAlbersUsa,
  geoPath,
  type GeoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
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

export const nationOutlinePath =
  pathGenerator(nationOutline as GeoPermissibleObjects) ?? "";
export const stateBordersPath =
  pathGenerator(stateBorders as GeoPermissibleObjects) ?? "";

const round = (n: number) => Math.round(n * 1000) / 1000;

export function project(lon: number, lat: number): [number, number] | null {
  const point = projection([lon, lat]);
  if (!point) return null;
  return [round(point[0]), round(point[1])];
}
