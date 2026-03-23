import type { BlocklistPatternRow } from "@/lib/rejections/blocklist-metrics";
import { ingestBlocklistScopeLabel } from "@/lib/rejections/ingest-blocklist-display";

interface IngestBlocklistVolumeCardProps {
  rows: BlocklistPatternRow[];
  windowDays: number;
  totalBlockedInWindow: number;
}

export function IngestBlocklistVolumeCard({
  rows,
  windowDays,
  totalBlockedInWindow,
}: IngestBlocklistVolumeCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Ingest blocklist volume</h3>
      <p className="mt-1 mb-4 text-xs text-muted-foreground leading-relaxed">
        Jobs the server refused at <code className="text-[11px]">POST /api/opportunities</code> because
        a block rule matched—not workflow scoring. Same rows as{" "}
        <strong className="text-foreground/80">amber</strong> cards on Disqualified. Use this to spot
        over-broad patterns.
      </p>
      <p className="mb-3 text-2xl font-bold tabular-nums text-card-foreground">
        {totalBlockedInWindow}
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          blocked in last {windowDays} days
        </span>
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blocklist activity in this window.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Pattern</th>
                <th className="pb-2 pr-3 font-medium">Top scope</th>
                <th className="pb-2 text-right font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.pattern} className="border-b border-border last:border-0">
                  <td className="py-2 pr-3">
                    <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs text-amber-950 dark:bg-amber-950/50 dark:text-amber-50">
                      {r.pattern}
                    </code>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground text-xs">
                    {ingestBlocklistScopeLabel(r.topScope)}
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium text-card-foreground">
                    {r.count}
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
