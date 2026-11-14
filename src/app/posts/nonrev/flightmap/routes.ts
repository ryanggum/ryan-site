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
  // signed slot in its airport pair's fan, toward the side this flight
  // bows to (its left of travel); see buildRouteSegments
  fan: number;
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
 * One segment per flight, with its slot in a fan shared by every flight
 * between the same two airports, either direction. Slots are evenly spaced
 * around the straight line, so at zero bow repeats and return flights
 * spread out alike. Each direction takes the half of the fan on the side it
 * bows toward (A->B one side, B->A the other, by seq within each), so
 * raising the bow from zero pulls the directions apart rather than
 * crossing them.
 */
export function buildRouteSegments(): RouteSegment[] {
  const byPair = new Map<string, Flight[]>();
  for (const flight of flights) {
    const key = [flight.from, flight.to].sort().join("-");
    byPair.set(key, [...(byPair.get(key) ?? []), flight]);
  }

  return [...byPair.values()].flatMap((group) => {
    // "forward" = alphabetical direction; its left of travel is the fan's
    // positive side, so the reverse direction (whose left is the negative
    // side) takes the first slots and has its slot negated
    const isForward = (f: Flight) => f.from < f.to;
    const ordered = [
      ...group.filter((f) => !isForward(f)),
      ...group.filter(isForward),
    ];
    return ordered.map((flight, k) => {
      const slot = k - (ordered.length - 1) / 2;
      return {
        seq: flight.seq,
        from: airport(flight.from),
        to: airport(flight.to),
        fan: isForward(flight) ? slot : -slot,
      };
    });
  });
}

export function getAirportsUsed(): Airport[] {
  const codes = new Set(flights.flatMap((f) => [f.from, f.to]));
  return [...codes].map(airport);
}
