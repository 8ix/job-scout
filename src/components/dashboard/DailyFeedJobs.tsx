"use client";

import { formatTimeAgo } from "@/lib/format";

export interface FeedJobCounts {
  source: string;
  opportunities: number;
  /** Workflow disqualified (POST /api/rejections), not ingest blocklist. */
  rejected: number;
  /** Ingest blocklist blocks for this feed in the last 24h. */
  blocked: number;
  lastReceivedAt?: Date | string | null;
  /** True when no ingest in the last 24h (opportunities + disqualified API activity). */
  stale?: boolean;
}

interface DailyFeedJobsProps {
  feeds: FeedJobCounts[];
}

export function DailyFeedJobs({ feeds }: DailyFeedJobsProps) {
  if (feeds.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Daily Feed Jobs (24h)
        </h3>
        <p className="text-sm text-muted-foreground">No feeds configured yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Daily Feed Jobs (24h)
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Per feed in the last 24 hours: opportunities (green), workflow disqualified (red), ingest
        blocklist blocks (amber). Last activity is whenever this feed last posted any of these — no
        separate heartbeat.
      </p>
      <div className="space-y-4">
        {feeds.map((f) => {
          const blocked = f.blocked ?? 0;
          const total = f.opportunities + f.rejected + blocked;
          const greenPct = total > 0 ? (f.opportunities / total) * 100 : 0;
          const redPct = total > 0 ? (f.rejected / total) * 100 : 0;
          const amberPct = total > 0 ? (blocked / total) * 100 : 0;
          return (
            <div
              key={f.source}
              className={`space-y-2 rounded-lg border p-3 ${
                f.stale
                  ? "border-amber-500/50 bg-amber-500/5 dark:border-amber-400/40 dark:bg-amber-400/5"
                  : "border-transparent"
              }`}
              data-testid={`daily-feed-row-${f.source}`}
            >
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-medium text-card-foreground">
                  {f.source}
                  {f.stale && (
                    <span className="ml-2 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100">
                      No ingest in 24h
                    </span>
                  )}
                  {f.lastReceivedAt != null ? (
                    <span className="font-normal text-muted-foreground ml-1 block sm:inline">
                      (last ingest {formatTimeAgo(new Date(f.lastReceivedAt))})
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground ml-1 block sm:inline">
                      (no recorded ingest)
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {f.opportunities} opps / {f.rejected} disqualified
                  {blocked > 0 ? ` / ${blocked} blocked` : ""}
                </span>
              </div>
              <div className="flex h-6 rounded overflow-hidden">
                <div
                  className="bg-success transition-all min-w-0 shrink-0"
                  style={{ width: `${greenPct}%` }}
                  title={`Opportunities: ${f.opportunities}`}
                />
                <div
                  className="bg-danger transition-all min-w-0 shrink-0"
                  style={{ width: `${redPct}%` }}
                  title={`Disqualified (workflow): ${f.rejected}`}
                />
                <div
                  className="bg-amber-500 transition-all min-w-0 shrink-0"
                  style={{ width: `${amberPct}%` }}
                  title={`Blocked (ingest list): ${blocked}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
