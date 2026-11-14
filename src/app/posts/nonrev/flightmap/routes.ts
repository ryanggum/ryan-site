import airportsData from "./airports.json";
import { flights, type Flight } from "./flights";

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

function airport(code: string): Airport {
  const a = airports[code];
  if (!a) throw new Error(`Unknown airport code: ${code}`);
  return a;
}

/**
 * One segment per flight, grouped by directed pair (A->B and B->A are
 * separate routes), each carrying its index `i` among the route's `n` flights
 * so repeats can fan out.
 */
export function buildRouteSegments(): RouteSegment[] {
  const byPair = new Map<string, Flight[]>();
  for (const flight of flights) {
    const key = `${flight.from}-${flight.to}`;
    byPair.set(key, [...(byPair.get(key) ?? []), flight]);
  }

  return [...byPair.values()].flatMap((group) =>
    group.map((flight, i) => ({
      seq: flight.seq,
      from: airport(flight.from),
      to: airport(flight.to),
      i,
      n: group.length,
    })),
  );
}

export function getAirportsUsed(): Airport[] {
  const codes = new Set(flights.flatMap((f) => [f.from, f.to]));
  return [...codes].map(airport);
}
