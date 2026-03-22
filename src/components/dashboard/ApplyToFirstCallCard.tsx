import type { ApplyToFirstCallStats } from "@/lib/stats/dashboard-review-metrics";

interface ApplyToFirstCallCardProps {
  stats: ApplyToFirstCallStats;
}

export function ApplyToFirstCallCard({ stats }: ApplyToFirstCallCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Apply → first call</h3>
      <p className="mt-1 mb-4 text-xs text-muted-foreground leading-relaxed">
        Median days from <code className="text-[11px]">appliedAt</code> to the first scheduled{" "}
        <strong className="text-foreground/80">screening or interview</strong> (by{" "}
        <code className="text-[11px]">scheduledAt</code>). Only applications with{" "}
        <code className="text-[11px]">appliedAt</code> in the last {stats.windowDays} days; pairs
        where the first call is before apply are excluded. Not employer response time.
      </p>
      {stats.sampleSize === 0 ? (
        <p className="text-sm text-muted-foreground">No qualifying applications in this window.</p>
      ) : (
        <div>
          <p className="text-3xl font-bold tabular-nums text-card-foreground">
            {stats.medianDays != null ? `${stats.medianDays} days` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Median · n = {stats.sampleSize} · last {stats.windowDays} days
          </p>
        </div>
      )}
    </div>
  );
}
