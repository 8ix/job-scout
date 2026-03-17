interface Heartbeat {
  id: string;
  source: string;
  jobsReceived: number;
  jobsNew: number;
  jobsScored: number;
  jobsOpportunity: number;
  ranAt: string | Date;
}

interface FeedHealthTableProps {
  heartbeats: Heartbeat[];
}

export function FeedHealthTable({ heartbeats }: FeedHealthTableProps) {
  if (heartbeats.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No heartbeat data available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Source</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Received</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">New</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Scored</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Opportunities</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ran At</th>
          </tr>
        </thead>
        <tbody>
          {heartbeats.map((hb) => (
            <tr key={hb.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-card-foreground">{hb.source}</td>
              <td className="px-4 py-3 text-right text-card-foreground">{hb.jobsReceived}</td>
              <td className="px-4 py-3 text-right text-card-foreground">{hb.jobsNew}</td>
              <td className="px-4 py-3 text-right text-card-foreground">{hb.jobsScored}</td>
              <td className="px-4 py-3 text-right text-card-foreground">{hb.jobsOpportunity}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {new Date(hb.ranAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
