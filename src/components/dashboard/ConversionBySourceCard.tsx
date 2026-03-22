import type { ConversionBySourceRow } from "@/lib/stats/dashboard-review-metrics";

interface ConversionBySourceCardProps {
  rows: ConversionBySourceRow[];
  windowDays: number;
}

export function ConversionBySourceCard({ rows, windowDays }: ConversionBySourceCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Conversion by source</h3>
      <p className="mt-1 mb-4 text-xs text-muted-foreground leading-relaxed">
        Cohort: opportunities <strong className="text-foreground/80">created</strong> in the last{" "}
        {windowDays} days. <strong className="text-foreground/80">Applied</strong> = same rows with
        any <code className="text-[11px]">appliedAt</code> (ever). Different from Source quality
        apply-rate, which uses applications submitted inside the window.
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No ingests in this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Source</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Ingested</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Applied</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.source} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium text-card-foreground">{r.source}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.ingested}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.applied}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {(r.rate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
