/**
 * Pipeline heat: top bands are closest to an offer; bottom is waiting (split by stage).
 * `stale` is appended last by `groupApplicationsByPipelineBandWithStale` only.
 */

import { STALE_APPLICATION_IDLE_DAYS } from "@/lib/constants/applications-ui";

export const PIPELINE_STAGES_TOP_FIRST = [
  "Offer",
  "Final Round",
  "Interview",
  "Screening",
  "Applied",
] as const;

export type PipelineStageName = (typeof PIPELINE_STAGES_TOP_FIRST)[number];

/** Waiting buckets: split by stage so Screening ≠ Applied on the board. */
export type PipelineWaitingBandKey = "screeningWaiting" | "appliedWaiting";

export type PipelineBandKey = PipelineStageName | PipelineWaitingBandKey | "stale";

/** Bands used by assignPipelineBand / core grouping (excludes `stale`). */
export const PIPELINE_CORE_BAND_ORDER: Exclude<PipelineBandKey, "stale">[] = [
  "Offer",
  "Final Round",
  "Interview",
  "Screening",
  "screeningWaiting",
  "Applied",
  "appliedWaiting",
];

/** @deprecated Use PIPELINE_CORE_BAND_ORDER; kept for clarity in imports. */
export const PIPELINE_BAND_ORDER = PIPELINE_CORE_BAND_ORDER;

export const BAND_DESCRIPTIONS: Record<PipelineBandKey, string> = {
  Offer: "Offers in hand or final negotiations",
  "Final Round": "Late-stage interviews",
  Interview: "Interview rounds (stage is Interview)",
  Screening: "Screening stage with at least one upcoming call on the calendar",
  screeningWaiting:
    "Screening stage but no future call logged — add a screening/interview event or follow up",
  Applied: "Applied with at least one upcoming call on the calendar",
  appliedWaiting:
    "Applied (or unset stage) with no future calls yet — schedule screening/interview or follow up",
  stale: `Applied at least ${STALE_APPLICATION_IDLE_DAYS} days ago with nothing scheduled — archive if the role is closed.`,
};

function nextUpcomingEvent(
  scheduledEvents: { scheduledAt: string }[],
  now: Date
): Date | null {
  const future = scheduledEvents
    .map((e) => new Date(e.scheduledAt))
    .filter((d) => d.getTime() >= now.getTime());
  if (future.length === 0) return null;
  return new Date(Math.min(...future.map((d) => d.getTime())));
}

export function hasUpcomingScheduledEvent(
  scheduledEvents: { scheduledAt: string }[],
  now: Date
): boolean {
  return nextUpcomingEvent(scheduledEvents, now) !== null;
}

/**
 * Idle stale: old enough since apply, and no future screening/interview on the calendar.
 */
export function isStaleIdleApplication(
  app: { appliedAt: string | null; scheduledEvents: { scheduledAt: string }[] },
  now: Date
): boolean {
  if (!app.appliedAt) return false;
  if (hasUpcomingScheduledEvent(app.scheduledEvents, now)) return false;
  const appliedMs = new Date(app.appliedAt).getTime();
  const days = (now.getTime() - appliedMs) / (1000 * 60 * 60 * 24);
  return days >= STALE_APPLICATION_IDLE_DAYS;
}

export function normalizeApplicationStage(stage: string | null | undefined): string {
  const s = stage?.trim();
  if (!s) return "Applied";
  return s;
}

/**
 * Assign each application to a vertical band. Late stages always show in their band.
 * Screening vs Applied waiting buckets are separate so the board matches pipeline stage.
 */
export function assignPipelineBand(
  stage: string | null | undefined,
  scheduledEvents: { scheduledAt: string }[],
  now: Date
): Exclude<PipelineBandKey, "stale"> {
  const s = normalizeApplicationStage(stage);
  const hasUpcoming = nextUpcomingEvent(scheduledEvents, now) !== null;

  if (s === "Offer" || s === "Final Round" || s === "Interview") {
    return s;
  }
  if (s === "Screening") {
    if (hasUpcoming) return "Screening";
    return "screeningWaiting";
  }
  if (s === "Applied") {
    if (hasUpcoming) return "Applied";
    return "appliedWaiting";
  }
  // Unknown stage: treat like Applied
  if (hasUpcoming) return "Applied";
  return "appliedWaiting";
}

export function sortWithinBand<T extends { scheduledEvents: { scheduledAt: string }[]; appliedAt: string | null }>(
  apps: T[],
  now: Date
): T[] {
  return [...apps].sort((a, b) => {
    const nextA = nextUpcomingEvent(a.scheduledEvents, now);
    const nextB = nextUpcomingEvent(b.scheduledEvents, now);
    if (nextA && nextB) return nextA.getTime() - nextB.getTime();
    if (nextA && !nextB) return -1;
    if (!nextA && nextB) return 1;
    const ta = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
    const tb = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
    return tb - ta;
  });
}

export function sortStaleOldestFirst<T extends { appliedAt: string | null }>(apps: T[]): T[] {
  return [...apps].sort((a, b) => {
    const ta = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
    const tb = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
    return ta - tb;
  });
}

export function groupApplicationsByPipelineBand<
  T extends {
    stage: string | null;
    scheduledEvents: { scheduledAt: string }[];
    appliedAt: string | null;
  },
>(
  applications: T[],
  now: Date = new Date()
): { band: Exclude<PipelineBandKey, "stale">; applications: T[] }[] {
  const buckets = new Map<Exclude<PipelineBandKey, "stale">, T[]>();
  for (const key of PIPELINE_CORE_BAND_ORDER) {
    buckets.set(key, []);
  }

  for (const app of applications) {
    const band = assignPipelineBand(app.stage, app.scheduledEvents, now);
    buckets.get(band)!.push(app);
  }

  return PIPELINE_CORE_BAND_ORDER.map((band) => ({
    band,
    applications: sortWithinBand(buckets.get(band)!, now),
  })).filter(({ applications: list }) => list.length > 0);
}

export function groupApplicationsByPipelineBandWithStale<
  T extends {
    stage: string | null;
    scheduledEvents: { scheduledAt: string }[];
    appliedAt: string | null;
  },
>(applications: T[], now: Date = new Date()): { band: PipelineBandKey; applications: T[] }[] {
  const stale: T[] = [];
  const active: T[] = [];
  for (const app of applications) {
    if (isStaleIdleApplication(app, now)) stale.push(app);
    else active.push(app);
  }

  const groups: { band: PipelineBandKey; applications: T[] }[] =
    groupApplicationsByPipelineBand(active, now);

  if (stale.length > 0) {
    groups.push({ band: "stale", applications: sortStaleOldestFirst(stale) });
  }
  return groups;
}

export function countDistinctStages(
  applications: { stage: string | null }[]
): number {
  const set = new Set<string>();
  for (const a of applications) {
    set.add(normalizeApplicationStage(a.stage));
  }
  return set.size;
}
