/**
 * Pipeline heat: top bands are closest to an offer; bottom is quiet / early.
 */

export const PIPELINE_STAGES_TOP_FIRST = [
  "Offer",
  "Final Round",
  "Interview",
  "Screening",
  "Applied",
] as const;

export type PipelineStageName = (typeof PIPELINE_STAGES_TOP_FIRST)[number];

export type PipelineBandKey = PipelineStageName | "quiet";

export const PIPELINE_BAND_ORDER: PipelineBandKey[] = [
  "Offer",
  "Final Round",
  "Interview",
  "Screening",
  "Applied",
  "quiet",
];

export const BAND_DESCRIPTIONS: Record<PipelineBandKey, string> = {
  Offer: "Offers in hand or final negotiations",
  "Final Round": "Late-stage interviews",
  Interview: "Interview rounds",
  Screening: "Screening & early calls scheduled",
  Applied: "Applied with upcoming activity",
  quiet: "No screening or interviews scheduled yet — follow up when ready",
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

export function normalizeApplicationStage(stage: string | null | undefined): string {
  const s = stage?.trim();
  if (!s) return "Applied";
  return s;
}

/**
 * Assign each application to a vertical band. Late stages always show in their band.
 * Applied / Screening without any future scheduled event go to `quiet`.
 */
export function assignPipelineBand(
  stage: string | null | undefined,
  scheduledEvents: { scheduledAt: string }[],
  now: Date
): PipelineBandKey {
  const s = normalizeApplicationStage(stage);
  const hasUpcoming = nextUpcomingEvent(scheduledEvents, now) !== null;

  if (s === "Offer" || s === "Final Round" || s === "Interview") {
    return s;
  }
  if (s === "Applied" || s === "Screening") {
    if (hasUpcoming) return s;
    return "quiet";
  }
  // Unknown stage: treat like Applied
  if (hasUpcoming) return "Applied";
  return "quiet";
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

export function groupApplicationsByPipelineBand<
  T extends {
    stage: string | null;
    scheduledEvents: { scheduledAt: string }[];
    appliedAt: string | null;
  },
>(applications: T[], now: Date = new Date()): { band: PipelineBandKey; applications: T[] }[] {
  const buckets = new Map<PipelineBandKey, T[]>();
  for (const key of PIPELINE_BAND_ORDER) {
    buckets.set(key, []);
  }

  for (const app of applications) {
    const band = assignPipelineBand(app.stage, app.scheduledEvents, now);
    buckets.get(band)!.push(app);
  }

  return PIPELINE_BAND_ORDER.map((band) => ({
    band,
    applications: sortWithinBand(buckets.get(band)!, now),
  })).filter(({ applications: list }) => list.length > 0);
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
