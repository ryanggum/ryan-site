// src/app/posts/go/departures/compute.ts
//
// "When do I need to leave?" — turns the MTA's GTFS-realtime feeds into the
// next few leave-by times, either from home (downtown Q at 96 St) or from
// work (uptown 1/2/3 at Penn, transferring to the uptown Q at Times Sq).

import GtfsRealtimeBindings from "gtfs-realtime-bindings";

const { transit_realtime } = GtfsRealtimeBindings;

export type Mode = "home" | "work";

export type LeaveOption = {
  // Unix seconds at which to walk out the door. The client counts down to
  // this between fetches; `leave_in` is the same value as of `now`.
  leave_at: number;
  leave_in: number;
  route?: string;
  // Unix seconds you walk in the door at the other end.
  eta: number;
  // True when some leg ran past the feed's horizon and the ETA leans on a
  // typical ride time (RIDE_*) instead of a prediction.
  eta_estimated: boolean;
  // Work only: seconds standing on the Q platform at Times Sq, i.e. Q
  // departure − 1/2/3 arrival − the transfer walk. Always from predictions.
  q_wait?: number;
};

// Both modes in one response: they need the same two feeds, so the client
// can switch between them without another request.
export type Departures = {
  now: number;
} & Record<Mode, LeaveOption[]>;

const FEEDS = {
  nqrw: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
  "123": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
} as const;

// GTFS stop IDs carry direction as a suffix: N = uptown, S = downtown.
// Verified against the live feeds on 2026-10-06.
const STOPS = {
  q96Downtown: "Q05S", // 96 St–2 Av, Q (and the odd N/R/W)
  q96Uptown: "Q05N",
  timesSqQDowntown: "R16S", // Times Sq–42 St, N/Q/R/W
  timesSqQUptown: "R16N",
  timesSq123Downtown: "127S", // Times Sq–42 St, 1/2/3
  timesSq123Uptown: "127N",
  penn123Downtown: "128S", // 34 St–Penn Station, 1/2/3
  pennUptown: "128N",
} as const;

const MIN = 60;
const WALK_TO_96 = 4 * MIN;
const WALK_TO_PENN = 8 * MIN;
const TIMES_SQ_TRANSFER = 3 * MIN;
const MAX_OPTIONS = 3;

// Typical ride times, only used when a leg has no prediction yet. Measured
// from the live feeds' own predictions on 2026-10-06 (Q downtown 11, Q
// uptown 12.5–15.5, 1/2/3 Times Sq <-> Penn 1–2).
const RIDE_Q_DOWNTOWN = 11 * MIN;
const RIDE_Q_UPTOWN = 13 * MIN;
const RIDE_123 = 2 * MIN;

// One trip's predicted times at the stops we care about, in unix seconds.
type Trip = {
  route: string;
  // stopId -> { arrival, departure } (either may be missing)
  stops: Map<string, { arrival?: number; departure?: number }>;
};

type Timestamp = number | { toNumber(): number } | null | undefined;

const toSeconds = (t: Timestamp) =>
  t == null ? undefined : typeof t === "number" ? t : t.toNumber();

async function fetchTrips(url: string): Promise<Trip[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`MTA feed ${res.status}: ${url}`);
  const feed = transit_realtime.FeedMessage.decode(
    new Uint8Array(await res.arrayBuffer()),
  );

  const trips: Trip[] = [];
  for (const entity of feed.entity) {
    const update = entity.tripUpdate;
    if (!update?.trip.routeId) continue;
    const stops: Trip["stops"] = new Map();
    for (const stu of update.stopTimeUpdate ?? []) {
      if (!stu.stopId) continue;
      stops.set(stu.stopId, {
        arrival: toSeconds(stu.arrival?.time),
        departure: toSeconds(stu.departure?.time),
      });
    }
    trips.push({ route: update.trip.routeId, stops });
  }
  return trips;
}

// Departure if present, otherwise arrival.
const departureAt = (trip: Trip, stopId: string) => {
  const s = trip.stops.get(stopId);
  return s?.departure ?? s?.arrival;
};

// Arrival if present, otherwise departure — for the stop you get off at.
const arrivalAt = (trip: Trip, stopId: string) => {
  const s = trip.stops.get(stopId);
  return s?.arrival ?? s?.departure;
};

const option = (
  leaveAt: number,
  now: number,
  eta: number,
  etaEstimated: boolean,
  route?: string,
): LeaveOption => ({
  leave_at: leaveAt,
  leave_in: Math.floor((leaveAt - now) / MIN),
  ...(route && { route }),
  eta,
  eta_estimated: etaEstimated,
});

const is123 = (t: Trip) => ["1", "2", "3"].includes(t.route);

function computeHome(
  nqrw: Trip[],
  trains123: Trip[],
  now: number,
): LeaveOption[] {
  // Mostly Qs, but the odd N/R/W also starts downtown from 96 St in the
  // morning. Any of them works as long as it's routed via Times Sq.
  const qs = nqrw
    .filter(
      (t) =>
        t.route === "Q" ||
        (["N", "R", "W"].includes(t.route) &&
          t.stops.has(STOPS.timesSqQDowntown)),
    )
    .map((t) => ({ trip: t, dep: departureAt(t, STOPS.q96Downtown) }))
    .filter(
      (q): q is { trip: Trip; dep: number } =>
        q.dep != null && q.dep - now >= WALK_TO_96,
    )
    .sort((a, b) => a.dep - b.dep)
    .slice(0, MAX_OPTIONS);

  // Downtown 1/2/3s with a Times Sq departure and a Penn arrival.
  const connections = trains123
    .filter(is123)
    .map((t) => ({
      timesSq: departureAt(t, STOPS.timesSq123Downtown),
      penn: arrivalAt(t, STOPS.penn123Downtown),
    }))
    .filter(
      (t): t is { timesSq: number; penn: number } =>
        t.timesSq != null && t.penn != null,
    );

  return qs.map(({ trip, dep }) => {
    const qArrival = arrivalAt(trip, STOPS.timesSqQDowntown);
    const atPlatform = (qArrival ?? dep + RIDE_Q_DOWNTOWN) + TIMES_SQ_TRANSFER;
    // First 1/2/3 you can make after the transfer walk.
    let next: (typeof connections)[number] | undefined;
    for (const c of connections) {
      if (c.timesSq < atPlatform) continue;
      if (!next || c.timesSq < next.timesSq) next = c;
    }
    const penn = next?.penn ?? atPlatform + RIDE_123;
    const estimated = qArrival == null || next == null;
    // Only label the stray N/R/W; a plain home row means the Q.
    const route = trip.route === "Q" ? undefined : trip.route;
    return option(dep - WALK_TO_96, now, penn + WALK_TO_PENN, estimated, route);
  });
}

function computeWork(nqrw: Trip[], trains123: Trip[], now: number) {
  const qs = nqrw
    .filter((t) => t.route === "Q")
    .map((t) => ({ trip: t, dep: departureAt(t, STOPS.timesSqQUptown) }))
    .filter(
      (q): q is { trip: Trip; dep: number } => q.dep != null && q.dep > now,
    )
    .sort((a, b) => a.dep - b.dep);

  // A 1/2/3 with no Times Sq prediction is skipped rather than estimated.
  const reachable = trains123
    .filter(is123)
    .map((t) => ({
      route: t.route,
      penn: departureAt(t, STOPS.pennUptown),
      timesSq: arrivalAt(t, STOPS.timesSq123Uptown),
    }))
    .filter(
      (t): t is { route: string; penn: number; timesSq: number } =>
        t.penn != null && t.timesSq != null && t.penn - now >= WALK_TO_PENN,
    );

  const used = new Set<(typeof reachable)[number]>();
  const options: LeaveOption[] = [];
  for (const { trip, dep } of qs) {
    if (options.length === MAX_OPTIONS) break;
    // Latest 1/2/3 that still makes this Q with the transfer buffer.
    let best: (typeof reachable)[number] | undefined;
    for (const t of reachable) {
      if (t.timesSq > dep - TIMES_SQ_TRANSFER) continue;
      if (!best || t.timesSq > best.timesSq) best = t;
    }
    if (!best || used.has(best)) continue;
    used.add(best);
    const q96 = arrivalAt(trip, STOPS.q96Uptown);
    const eta = (q96 ?? dep + RIDE_Q_UPTOWN) + WALK_TO_96;
    options.push({
      ...option(best.penn - WALK_TO_PENN, now, eta, q96 == null, best.route),
      q_wait: dep - best.timesSq - TIMES_SQ_TRANSFER,
    });
  }
  return options;
}

export async function getDepartures(): Promise<Departures> {
  const [nqrw, trains123] = await Promise.all([
    fetchTrips(FEEDS.nqrw),
    fetchTrips(FEEDS["123"]),
  ]);
  const now = Math.floor(Date.now() / 1000);
  return {
    now,
    home: computeHome(nqrw, trains123, now),
    work: computeWork(nqrw, trains123, now),
  };
}
