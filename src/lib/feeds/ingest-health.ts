/** Time window after which we flag a feed if no opportunity/rejection was ingested. */
export const FEED_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Whether a feed should be flagged: never ingested, or last ingest older than 24h.
 */
export function isFeedIngestStale(
  lastIngestAt: Date | null,
  now: Date = new Date()
): boolean {
  if (!lastIngestAt) return true;
  return now.getTime() - lastIngestAt.getTime() > FEED_STALE_AFTER_MS;
}

export type FeedIngestUiStatus = "ok" | "stale";

export function feedIngestUiStatus(
  lastIngestAt: Date | null,
  now: Date = new Date()
): FeedIngestUiStatus {
  return isFeedIngestStale(lastIngestAt, now) ? "stale" : "ok";
}
