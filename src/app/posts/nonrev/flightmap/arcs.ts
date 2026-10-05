export type Point = [number, number];

const BOW_RATIO = 0.09; // bow as a fraction of chord length, so short and long flights curve proportionally
const FAN_GAP = 6; // px, fixed spacing between sibling flights on the same route (not proportional)

/**
 * Control point + SVG path for one flight between two projected points,
 * offset by its index (i) among n total flights on the same directed route.
 * Bows proportionally to the chord's own length so short and long flights
 * curve at the same visual ratio, and always to the same side of travel so
 * A->B and B->A separate visually. Repeat flights on one route fan out
 * symmetrically (fixed px spacing) around that base bow.
 */
export function arcGeometry(
  from: Point,
  to: Point,
  i: number,
  n: number,
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

  const fanOffset = (i - (n - 1) / 2) * FAN_GAP;
  const bow = length * BOW_RATIO + fanOffset;

  const midX = (x1 + x2) / 2 + nx * bow;
  const midY = (y1 + y2) / 2 + ny * bow;

  return {
    control: [midX, midY],
    d: `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`,
  };
}

/**
 * Shortest distance from `point` to the quadratic Bézier curve defined by
 * `from` -> `control` -> `to`, approximated by sampling the curve. Used for
 * pointer hit-testing (native stroke hitboxes on thin/overlapping arcs are
 * unreliable), not for rendering, so a coarse sample count is fine.
 */
export function distanceToQuadratic(
  point: Point,
  from: Point,
  control: Point,
  to: Point,
  samples = 24,
): number {
  let min = Infinity;
  for (let s = 0; s <= samples; s++) {
    const [x, y] = pointOnQuadratic(from, control, to, s / samples);
    const dist = Math.hypot(x - point[0], y - point[1]);
    if (dist < min) min = dist;
  }
  return min;
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
