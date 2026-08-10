// src/lib/groupByYear.ts

/**
 * Buckets items by year (descending), sorting each year's bucket with
 * `compareWithinYear` (also expected to sort descending, by convention).
 */
export function groupByYear<T>(
  items: readonly T[],
  getYear: (item: T) => number,
  compareWithinYear: (a: T, b: T) => number,
): [number, T[]][] {
  const map = new Map<number, T[]>();

  for (const item of items) {
    const year = getYear(item);
    const bucket = map.get(year);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(year, [item]);
    }
  }

  for (const bucket of map.values()) {
    bucket.sort(compareWithinYear);
  }

  return Array.from(map.entries()).sort(([a], [b]) => b - a);
}
