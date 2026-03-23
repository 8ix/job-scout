import type { PrismaClient } from "@/generated/prisma/client";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";
import { getCurrentMonthBounds, getPreviousMonthBounds } from "./monthly-window";
import { getCurrentWeekBounds, getPreviousWeekBounds } from "./weekly-window";

export type ApplicationGoalSettingsDTO = {
  id: string;
  timezone: string;
  weekStartsOn: number;
  weeklyTargetCount: number;
  monthlyTargetCount: number;
};

export type CadenceProgressDTO = {
  enabled: boolean;
  target: number;
  currentCount: number;
  previousCount: number;
  currentHit: boolean;
  previousHit: boolean;
  currentStartIso: string;
  currentEndIso: string;
  previousStartIso: string;
  previousEndIso: string;
  /** Short label for UI, e.g. "Mar 10 – Mar 16, 2025" */
  currentLabel: string;
  previousLabel: string;
};

export type ApplicationGoalsDashboardDTO = {
  settings: ApplicationGoalSettingsDTO;
  weekly: CadenceProgressDTO | null;
  monthly: CadenceProgressDTO | null;
};

function formatRangeLabel(start: Date, end: Date, timeZone: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const endInclusive = new Date(end.getTime() - 1);
  const a = new Intl.DateTimeFormat("en", opts).format(start);
  const b = new Intl.DateTimeFormat("en", opts).format(endInclusive);
  return a === b ? a : `${a} – ${b}`;
}

async function countMeaningfulInRange(
  prisma: PrismaClient,
  startUtc: Date,
  endUtc: Date,
  scoreMin: number
): Promise<number> {
  return prisma.opportunity.count({
    where: {
      appliedAt: { gte: startUtc, lt: endUtc },
      score: { gte: scoreMin },
    },
  });
}

function buildCadence(
  enabled: boolean,
  target: number,
  currentCount: number,
  previousCount: number,
  current: { startUtc: Date; endUtc: Date },
  previous: { startUtc: Date; endUtc: Date },
  timeZone: string
): CadenceProgressDTO {
  return {
    enabled,
    target,
    currentCount,
    previousCount,
    currentHit: target > 0 && currentCount >= target,
    previousHit: target > 0 && previousCount >= target,
    currentStartIso: current.startUtc.toISOString(),
    currentEndIso: current.endUtc.toISOString(),
    previousStartIso: previous.startUtc.toISOString(),
    previousEndIso: previous.endUtc.toISOString(),
    currentLabel: formatRangeLabel(current.startUtc, current.endUtc, timeZone),
    previousLabel: formatRangeLabel(previous.startUtc, previous.endUtc, timeZone),
  };
}

export async function ensureApplicationGoalSettings(prisma: PrismaClient) {
  return prisma.applicationGoalSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      timezone: "UTC",
      weekStartsOn: 1,
      weeklyTargetCount: 0,
      monthlyTargetCount: 0,
    },
    update: {},
  });
}

export async function getApplicationGoalsDashboardData(
  prisma: PrismaClient,
  now: Date = new Date()
): Promise<ApplicationGoalsDashboardDTO> {
  const settingsRow = await ensureApplicationGoalSettings(prisma);
  const settings: ApplicationGoalSettingsDTO = {
    id: settingsRow.id,
    timezone: settingsRow.timezone,
    weekStartsOn: settingsRow.weekStartsOn,
    weeklyTargetCount: settingsRow.weeklyTargetCount,
    monthlyTargetCount: settingsRow.monthlyTargetCount,
  };

  const scoreMin = DEFAULT_OPPORTUNITY_SCORE_MIN;
  const tz = settings.timezone;

  let weekly: CadenceProgressDTO | null = null;
  if (settings.weeklyTargetCount > 0) {
    const curW = getCurrentWeekBounds(now, settings.weekStartsOn, tz);
    const prevW = getPreviousWeekBounds(now, settings.weekStartsOn, tz);
    const [currentCount, previousCount] = await Promise.all([
      countMeaningfulInRange(prisma, curW.startUtc, curW.endUtc, scoreMin),
      countMeaningfulInRange(prisma, prevW.startUtc, prevW.endUtc, scoreMin),
    ]);
    weekly = buildCadence(
      true,
      settings.weeklyTargetCount,
      currentCount,
      previousCount,
      curW,
      prevW,
      tz
    );
  }

  let monthly: CadenceProgressDTO | null = null;
  if (settings.monthlyTargetCount > 0) {
    const curM = getCurrentMonthBounds(now, tz);
    const prevM = getPreviousMonthBounds(now, tz);
    const [currentCount, previousCount] = await Promise.all([
      countMeaningfulInRange(prisma, curM.startUtc, curM.endUtc, scoreMin),
      countMeaningfulInRange(prisma, prevM.startUtc, prevM.endUtc, scoreMin),
    ]);
    monthly = buildCadence(
      true,
      settings.monthlyTargetCount,
      currentCount,
      previousCount,
      curM,
      prevM,
      tz
    );
  }

  return { settings, weekly, monthly };
}
