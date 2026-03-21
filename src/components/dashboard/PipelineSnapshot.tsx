import Link from "next/link";
import type { PipelineStageCount } from "@/lib/stats/pipeline-snapshot";

interface PipelineSnapshotProps {
  totalActive: number;
  stages: PipelineStageCount[];
}

export function PipelineSnapshot({ totalActive, stages }: PipelineSnapshotProps) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Pipeline snapshot</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Active applications (<code className="text-[11px]">status: applied</code>) by stage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tabular-nums text-card-foreground">{totalActive}</span>
          <Link
            href="/applications"
            className="text-xs font-medium text-primary hover:underline"
          >
            View applications
          </Link>
        </div>
      </div>
      {totalActive === 0 ? (
        <p className="text-sm text-muted-foreground">No active applications.</p>
      ) : (
        <ul className="space-y-3">
          {stages.map((s) => (
            <li key={s.stage}>
              <div className="mb-1 flex justify-between gap-2 text-xs">
                <span className="font-medium text-card-foreground">{s.stage}</span>
                <span className="tabular-nums text-muted-foreground">{s.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-600/80 dark:bg-emerald-500/80"
                  style={{ width: `${(s.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
