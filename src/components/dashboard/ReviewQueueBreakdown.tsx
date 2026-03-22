import type {
  ReviewQueueScoreRow,
  ReviewQueueVerdictRow,
} from "@/lib/stats/dashboard-review-metrics";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";

interface ReviewQueueBreakdownProps {
  byVerdict: ReviewQueueVerdictRow[];
  byScore: ReviewQueueScoreRow[];
}

export function ReviewQueueBreakdown({ byVerdict, byScore }: ReviewQueueBreakdownProps) {
  const maxV = Math.max(...byVerdict.map((r) => r.count), 1);
  const maxS = Math.max(...byScore.map((r) => r.count), 1);
  const total = byVerdict.reduce((a, r) => a + r.count, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Review queue</h3>
      <p className="mt-1 mb-4 text-xs text-muted-foreground">
        Opportunities with status <strong className="text-foreground/80">new</strong> and score ≥{" "}
        {DEFAULT_OPPORTUNITY_SCORE_MIN} (same as default list). Total:{" "}
        <strong className="text-foreground/80">{total}</strong>
      </p>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing in queue.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">By verdict</p>
            <ul className="space-y-2">
              {byVerdict.map((r) => (
                <li key={r.verdict}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-card-foreground truncate pr-2">{r.verdict}</span>
                    <span className="tabular-nums text-muted-foreground shrink-0">{r.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/80"
                      style={{ width: `${(r.count / maxV) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">By score</p>
            <ul className="space-y-2">
              {byScore.map((r) => (
                <li key={r.score}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-card-foreground">{r.score}</span>
                    <span className="tabular-nums text-muted-foreground">{r.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-success/70"
                      style={{ width: `${(r.count / maxS) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
