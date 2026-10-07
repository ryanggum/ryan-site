"use client";
// src/app/posts/go/LeaveBoard.tsx

import { useEffect, useState } from "react";
import type { Departures, Mode } from "./departures/compute";

// Before noon in New York = home, after = work. Computed on the client: the
// page itself is statically built, so server time would be build time.
function defaultMode(): Mode {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  return hour < 12 ? "home" : "work";
}

const clockFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
});

// "11:14 PM" -> "11:14p"
const clock = (unixSeconds: number) => {
  const parts = clockFormat.formatToParts(unixSeconds * 1000);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")}${get("dayPeriod")[0].toLowerCase()}`;
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; data: Departures };

export default function LeaveBoard() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [now, setNow] = useState(() => Date.now() / 1000);

  useEffect(() => setMode(defaultMode()), []);

  // Fetch once per page load; refresh the page for new predictions. One
  // response covers both modes, so toggling never fetches.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/posts/go/departures", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        setState({ status: "ok", data: await res.json() });
      } catch {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    })();
    return () => controller.abort();
  }, []);

  // Count each line down from that one fetch.
  useEffect(() => {
    // Ticks 4x a second so setInterval drift never makes a second skip.
    const id = setInterval(() => setNow(Date.now() / 1000), 250);
    return () => clearInterval(id);
  }, []);

  if (!mode) return null;

  const options =
    state.status === "ok"
      ? state.data[mode]
          // Stops at 0 rather than dropping the line.
          .map((o) => ({
            ...o,
            remaining: Math.max(0, Math.floor(o.leave_at - now)),
          }))
      : [];

  return (
    <div className="max-w-[75ch] mx-auto my-6 text-black dark:text-white">
      <div className="flex gap-2 mb-6">
        {(["home", "work"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`px-3 py-1 border border-black dark:border-white cursor-pointer ${
              mode === m
                ? "bg-black text-white dark:bg-white dark:text-black"
                : ""
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {state.status === "error" && <p>feed error</p>}

      {state.status === "ok" && (
        // Font scales with viewport width, capped at text-2xl's 1.5rem, so the
        // longest line (~38 chars, "leave in 12:34 (2) eta ~11:14p (12 min)")
        // fits on one line down to a 320px-wide phone instead of wrapping.
        <ul className="space-y-2 text-[length:min(1.5rem,calc(4.4vw_-_1px))] leading-snug whitespace-nowrap tabular-nums">
          {options.map((o) => (
            <li key={o.leave_at + (o.route ?? "")}>
              leave in {Math.floor(o.remaining / 60)}:
              {String(o.remaining % 60).padStart(2, "0")}
              {o.route && ` (${o.route})`} eta {o.eta_estimated && "~"}
              {clock(o.eta)}
              {/* Door to door: walking out at leave_at to walking in at eta. */}
              {mode === "home" &&
                ` (${o.eta_estimated ? "~" : ""}${Math.round((o.eta - o.leave_at) / 60)} min)`}
              {/* Wait on the Q platform at Times Sq after the transfer walk. */}
              {o.q_wait != null && ` (${Math.round(o.q_wait / 60)} min)`}
            </li>
          ))}
          {options.length < 3 && (
            <li className="text-base opacity-60">no further predictions.</li>
          )}
        </ul>
      )}
    </div>
  );
}
