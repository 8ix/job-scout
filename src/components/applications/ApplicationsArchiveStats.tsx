import type { ArchivedApplicationsSummary } from "@/lib/applications/archived-stats";

export function ApplicationsArchiveStats({ summary }: { summary: ArchivedApplicationsSummary }) {
  if (summary.total === 0) return null;

  const { byReason } = summary;

  return (
    <section className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Closed applications — summary</h3>
      <p className="text-xs text-muted-foreground">
        Counts are for applications you applied to and then closed (rejected, archived, or auto-archived).
        “Had interview / screening+” means a Screening, Interview, Final Round, or Offer stage appeared in
        the timeline before close.
      </p>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Total closed</dt>
          <dd className="font-semibold tabular-nums text-card-foreground">{summary.total}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Employer rejected</dt>
          <dd className="font-semibold tabular-nums text-card-foreground">{byReason.employerRejected}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Archived (manual)</dt>
          <dd className="font-semibold tabular-nums text-card-foreground">{byReason.userArchived}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Stale (auto-archived)</dt>
          <dd className="font-semibold tabular-nums text-card-foreground">{byReason.staleAuto}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Unknown / legacy</dt>
          <dd className="font-semibold tabular-nums text-card-foreground">{byReason.unknown}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Had interview / screening+</dt>
          <dd className="font-semibold tabular-nums text-card-foreground">
            {summary.closedWithInterviewExposure}
          </dd>
        </div>
      </dl>
    </section>
  );
}
