import airportsData from "./airports.json";
import { flights } from "./flights";

export type Airport = {
  code: string;
  name: string;
  lat: number;
  lon: number;
};

export type RouteSegment = {
  seq: number;
  from: Airport;
  to: Airport;
  i: number;
  n: number;
};

const airports: Record<string, Airport> = Object.fromEntries(
  Object.entries(airportsData).map(([code, a]) => [code, { code, ...a }]),
);

export function buildRouteSegments(): RouteSegment[] {
  const byPair = new Map<string, typeof flights>();

  for (const flight of flights) {
    const key = `${flight.from}-${flight.to}`;
    const group = byPair.get(key) ?? [];
    group.push(flight);
    byPair.set(key, group);
  }

  const segments: RouteSegment[] = [];

  for (const group of byPair.values()) {
    const n = group.length;
    group.forEach((flight, i) => {
      const from = airports[flight.from];
      const to = airports[flight.to];
      if (!from || !to) {
        throw new Error(`Unknown airport code in flight seq ${flight.seq}`);
      }
      segments.push({ seq: flight.seq, from, to, i, n });
    });
  }

  return segments;
}

export function getAirportsUsed(): Airport[] {
  const codes = new Set<string>();
  for (const f of flights) {
    codes.add(f.from);
    codes.add(f.to);
  }
  return Array.from(codes).map((code) => {
    const airport = airports[code];
    if (!airport) throw new Error(`Unknown airport code: ${code}`);
    return airport;
  });
}
