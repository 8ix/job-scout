import { addMonths, startOfMonth, subMonths } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

import type { PeriodBounds } from "./weekly-window";

/**
 * Calendar month in `timeZone`, as UTC half-open range [start, end).
 */
export function getCurrentMonthBounds(now: Date, timeZone: string): PeriodBounds {
  const z = toZonedTime(now, timeZone);
  const monthStartZ = startOfMonth(z);
  const nextMonthStartZ = startOfMonth(addMonths(monthStartZ, 1));
  return {
    startUtc: fromZonedTime(monthStartZ, timeZone),
    endUtc: fromZonedTime(nextMonthStartZ, timeZone),
  };
}

export function getPreviousMonthBounds(now: Date, timeZone: string): PeriodBounds {
  const cur = getCurrentMonthBounds(now, timeZone);
  const monthStartZ = toZonedTime(cur.startUtc, timeZone);
  const prevMonthStartZ = startOfMonth(subMonths(monthStartZ, 1));
  return {
    startUtc: fromZonedTime(prevMonthStartZ, timeZone),
    endUtc: cur.startUtc,
  };
}
