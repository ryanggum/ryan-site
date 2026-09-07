export type Point = [number, number];

const BOW_RATIO = 0.09; // bow as a fraction of chord length, so short and long flights curve proportionally
const FAN_GAP = 6; // px, fixed spacing between sibling flights on the same route (not proportional)

/**
 * Path for one flight between two projected points, offset by its index (i)
 * among n total flights on the same directed route. Bows proportionally to
 * the chord's own length so short and long flights curve at the same visual
 * ratio, and always to the same side of travel so A->B and B->A separate
 * visually. Repeat flights on one route fan out symmetrically (fixed px
 * spacing) around that base bow.
 */
export function arcPath(from: Point, to: Point, i: number, n: number): string {
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

  return `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
}
