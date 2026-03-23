import { addWeeks, startOfWeek, subDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type PeriodBounds = { startUtc: Date; endUtc: Date };

/**
 * Week boundaries in `timeZone`, converted to UTC instants. End is exclusive.
 * Uses date-fns + date-fns-tz; accurate when the process timezone is UTC (typical for servers).
 */
export function getCurrentWeekBounds(
  now: Date,
  weekStartsOn: number,
  timeZone: string
): PeriodBounds {
  const zonedNow = toZonedTime(now, timeZone);
  const weekStartZ = startOfWeek(zonedNow, {
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });
  const weekEndZ = addWeeks(weekStartZ, 1);
  return {
    startUtc: fromZonedTime(weekStartZ, timeZone),
    endUtc: fromZonedTime(weekEndZ, timeZone),
  };
}

export function getPreviousWeekBounds(
  now: Date,
  weekStartsOn: number,
  timeZone: string
): PeriodBounds {
  const current = getCurrentWeekBounds(now, weekStartsOn, timeZone);
  const weekStartZ = toZonedTime(current.startUtc, timeZone);
  const prevWeekStartZ = subDays(weekStartZ, 7);
  return {
    startUtc: fromZonedTime(prevWeekStartZ, timeZone),
    endUtc: current.startUtc,
  };
}
