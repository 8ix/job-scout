import type { SourceQualityRow } from "@/lib/stats/source-quality";

interface SourceQualityTableProps {
  rows: SourceQualityRow[];
  windowDays: number;
}

export function SourceQualityTable({ rows, windowDays }: SourceQualityTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Source quality</h3>
      <p className="mt-1 mb-4 text-xs text-muted-foreground leading-relaxed">
        Last <strong className="font-medium text-foreground/80">{windowDays} days</strong>, per
        feed/source. Apply rate = applications with <code className="text-[11px]">appliedAt</code> in
        this window ÷ opportunities ingested in the same window (not a full funnel).{" "}
        <strong className="font-medium text-foreground/80">Disqualified-only</strong> counts listing
        rejects with no matching opportunity row (same dedupe as score distribution).
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No ingest activity in this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Source</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Ingested</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Avg score</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Applied</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Apply rate</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">DQ-only</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.source} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium text-card-foreground">{r.source}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.opportunitiesIngested}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.avgScore != null ? r.avgScore : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.appliedInWindow}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {(r.applyRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.disqualifiedOnly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
