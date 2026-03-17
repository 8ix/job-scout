interface HeartbeatData {
  source: string;
  ranAt: string;
  jobsReceived: number;
  jobsNew: number;
  jobsScored: number;
  jobsOpportunity: number;
}

interface HeartbeatPanelProps {
  heartbeats: HeartbeatData[];
}

export function getHeartbeatStatus(ranAt: string | null): "green" | "amber" | "red" {
  if (!ranAt) return "red";
  const hoursAgo = (Date.now() - new Date(ranAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo <= 25) return "green";
  if (hoursAgo <= 48) return "amber";
  return "red";
}

const statusColors = {
  green: "bg-success",
  amber: "bg-warning",
  red: "bg-danger",
};

export function HeartbeatPanel({ heartbeats }: HeartbeatPanelProps) {
  if (heartbeats.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Feed Health</h3>
        <p className="text-sm text-muted-foreground">No feed data available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Feed Health</h3>
      <div className="space-y-3">
        {heartbeats.map((hb) => {
          const status = getHeartbeatStatus(hb.ranAt);
          return (
            <div key={hb.source} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
                <span className="text-sm font-medium text-card-foreground">{hb.source}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{hb.jobsReceived} received</span>
                <span>{hb.jobsOpportunity} opportunities</span>
                <span>{new Date(hb.ranAt).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
