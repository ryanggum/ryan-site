export type Point = [number, number];

const BOW_RATIO = 0.09; // bow as a fraction of chord length, so short and long flights curve proportionally
const WIND_RATIO = 0.1; // downwind push on the control point per unit of wind, as a fraction of chord length
const FAN_GAP = 6; // px, fixed spacing between flights on the same airport pair (not proportional)

/**
 * Control point + SVG path for one flight between two projected points.
 * Bows proportionally to the chord's own length so short and long flights
 * curve at the same visual ratio, and always to the same side of travel so
 * A->B and B->A separate visually; `bowScale` multiplies that bow (0 =
 * straight, negative bows to the other side). `fan` (see RouteSegment) then
 * adds a fixed-spacing offset, unscaled, so flights between the same two
 * airports stay apart at any bow, including straight.
 *
 * `wind` (direction times strength, viewBox axes) pushes the control point
 * downwind in proportion to chord length, so longer flights drift more.
 * Crosswind routes bulge downwind; routes along the wind skew instead, their
 * peak sliding downwind. Flights on one airport pair are the same length, so
 * they all shift alike and the fan holds.
 */
export function arcGeometry(
  from: Point,
  to: Point,
  fan: number,
  bowScale = 1,
  wind: Point = [0, 0],
): { control: Point; d: string } {
  const [x1, y1] = from;
  const [x2, y2] = to;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;

  // unit vector perpendicular to the chord, rotated so it points to a
  // consistent side of the direction of travel
  const nx = -dy / length;
  const ny = dx / length;

  const bow = length * BOW_RATIO * bowScale + fan * FAN_GAP;

  const drift = length * WIND_RATIO;
  const midX = (x1 + x2) / 2 + nx * bow + wind[0] * drift;
  const midY = (y1 + y2) / 2 + ny * bow + wind[1] * drift;

  return {
    control: [midX, midY],
    d: `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`,
  };
}

/**
 * Shortest distance from `point` to the quadratic Bézier curve defined by
 * `from` -> `control` -> `to`, approximated as a polyline through `samples`
 * segments. Used for pointer hit-testing (native stroke hitboxes on
 * thin/overlapping arcs are unreliable), not for rendering.
 *
 * Measures to each segment, not just its endpoints: distance to the sample
 * points alone left gaps up to half the sample spacing (~15 units on
 * LAX-JFK), wider than the hit radius, so a cursor sitting exactly on a long
 * arc only registered near the sample points. The polyline itself hugs the
 * curve to within a small fraction of a unit at this sample count.
 *
 * `tMax` limits the test to the curve from `from` up to that parameter, for
 * an arc that's only partly drawn (draw mode): the undrawn rest isn't hit.
 */
export function distanceToQuadratic(
  point: Point,
  from: Point,
  control: Point,
  to: Point,
  tMax = 1,
  samples = 24,
): number {
  let min = Infinity;
  let prev = from;
  for (let s = 1; s <= samples; s++) {
    const next = pointOnQuadratic(from, control, to, (s / samples) * tMax);
    const dist = distanceToSegment(point, prev, next);
    if (dist < min) min = dist;
    prev = next;
  }
  return min;
}

function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSq = dx * dx + dy * dy;
  // projection of point onto the segment, clamped to its endpoints
  const t =
    lengthSq === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSq,
          ),
        );
  return Math.hypot(point[0] - (a[0] + t * dx), point[1] - (a[1] + t * dy));
}

/** Point at parameter t (0..1) on the quadratic Bézier from -> control -> to. */
export function pointOnQuadratic(
  from: Point,
  control: Point,
  to: Point,
  t: number,
): Point {
  const mt = 1 - t;
  return [
    mt * mt * from[0] + 2 * mt * t * control[0] + t * t * to[0],
    mt * mt * from[1] + 2 * mt * t * control[1] + t * t * to[1],
  ];
}

/** Direction of travel (unnormalized derivative) at parameter t. */
export function tangentOnQuadratic(
  from: Point,
  control: Point,
  to: Point,
  t: number,
): Point {
  const mt = 1 - t;
  return [
    2 * mt * (control[0] - from[0]) + 2 * t * (to[0] - control[0]),
    2 * mt * (control[1] - from[1]) + 2 * t * (to[1] - control[1]),
  ];
}
