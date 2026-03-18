"use client";

import { formatTimeAgo } from "@/lib/format";

export interface FeedJobCounts {
  source: string;
  opportunities: number;
  rejected: number;
  lastReceivedAt?: Date | string | null;
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
        Opportunities vs rejections per feed in the last 24 hours
      </p>
      <div className="space-y-4">
        {feeds.map((f) => {
          const total = f.opportunities + f.rejected;
          const greenPct = total > 0 ? (f.opportunities / total) * 100 : 50;
          const redPct = total > 0 ? (f.rejected / total) * 100 : 50;
          return (
            <div key={f.source} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-card-foreground">
                  {f.source}
                  {f.lastReceivedAt != null && (
                    <span className="font-normal text-muted-foreground ml-1">
                      (last received {formatTimeAgo(new Date(f.lastReceivedAt))})
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {f.opportunities} opps / {f.rejected} rejected
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
                  title={`Rejected: ${f.rejected}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
