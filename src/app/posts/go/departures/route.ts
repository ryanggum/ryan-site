// src/app/posts/go/departures/route.ts
//
// GET /posts/go/departures — the one runtime (non-static) route on the
// site; it reads live MTA predictions and returns both home and work options.

import { getDepartures } from "./compute";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getDepartures(), {
      headers: {
        // The MTA feeds only refresh every ~30s, so let Vercel's CDN answer
        // repeat requests for 20s instead of re-invoking this function and
        // re-fetching both feeds. Browsers still always ask (max-age=0); the
        // client recomputes "leave in" from the absolute leave_at, so a
        // response up to 20s old still counts down correctly.
        "Cache-Control": "public, max-age=0, s-maxage=20",
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "feed unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
