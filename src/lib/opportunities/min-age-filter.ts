/**
 * Optional URL filter: only opportunities created on or before the start of the day
 * that was `minAgeDays` ago (i.e. at least `minAgeDays` full calendar days old by local date math).
 */
export function parseMinAgeDays(param: string | undefined): number | null {
  if (param == null || param === "") return null;
  const n = parseInt(param, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

/** Upper bound for `createdAt` (inclusive of older rows). Uses UTC date boundaries. */
export function createdAtLteForMinAgeDays(minAgeDays: number, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - minAgeDays);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
