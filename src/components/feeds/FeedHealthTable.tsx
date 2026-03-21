export interface FeedIngestHealthRow {
  source: string;
  lastIngestAt: string | null;
  opportunities24h: number;
  disqualified24h: number;
  stale: boolean;
}

interface FeedHealthTableProps {
  rows: FeedIngestHealthRow[];
}

export function FeedHealthTable({ rows }: FeedHealthTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No feeds configured yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <p className="border-b border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        Health is inferred from the latest <strong>opportunity</strong> or <strong>disqualified</strong>{" "}
        API ingest per feed. If nothing arrived in <strong>24 hours</strong>, the feed is flagged.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Feed</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Opps (24h)</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Disqualified (24h)</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Last ingest</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.source}
              className={`border-b border-border last:border-0 ${
                row.stale ? "bg-amber-500/5 dark:bg-amber-400/5" : ""
              }`}
            >
              <td className="px-4 py-3 font-medium text-card-foreground">{row.source}</td>
              <td className="px-4 py-3">
                {row.stale ? (
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100">
                    Check pipeline
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                    OK
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-card-foreground">{row.opportunities24h}</td>
              <td className="px-4 py-3 text-right text-card-foreground">{row.disqualified24h}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {row.lastIngestAt
                  ? new Date(row.lastIngestAt).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
