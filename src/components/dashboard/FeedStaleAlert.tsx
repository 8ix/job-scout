import Link from "next/link";

interface FeedStaleAlertProps {
  /** Feed names with no ingest in the last 24 hours */
  staleSources: string[];
}

export function FeedStaleAlert({ staleSources }: FeedStaleAlertProps) {
  if (staleSources.length === 0) return null;

  const list =
    staleSources.length === 1
      ? staleSources[0]
      : `${staleSources.slice(0, -1).join(", ")} and ${staleSources.at(-1)}`;

  return (
    <div
      className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100"
      role="status"
      data-testid="feed-stale-alert"
    >
      <p className="font-medium">Possible feed issue</p>
      <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
        No opportunities or disqualified listings were ingested in the last 24 hours for:{" "}
        <strong>{list}</strong>. Health is based on API activity only (not a separate heartbeat).
        Check your n8n workflows or pipeline.
      </p>
      <Link
        href="/feeds"
        className="mt-2 inline-block font-medium text-amber-950 underline underline-offset-2 hover:no-underline dark:text-amber-50"
      >
        View feeds
      </Link>
    </div>
  );
}
