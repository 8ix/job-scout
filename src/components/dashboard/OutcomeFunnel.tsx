import type { OutcomeFunnelSnapshot } from "@/lib/stats/outcome-funnel";

interface OutcomeFunnelProps {
  seven: OutcomeFunnelSnapshot;
  thirty: OutcomeFunnelSnapshot;
}

function FunnelColumn({ label, data }: { label: string; data: OutcomeFunnelSnapshot }) {
  const max = Math.max(data.ingested, data.applied, data.disqualifiedListings, 1);
  const steps = [
    { key: "ingested", title: "Opportunities ingested", value: data.ingested },
    { key: "applied", title: "Applied (appliedAt in window)", value: data.applied },
    {
      key: "dq",
      title: "Disqualified listings",
      value: data.disqualifiedListings,
    },
  ] as const;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {steps.map((s) => (
        <div key={s.key}>
          <div className="mb-1 flex justify-between gap-2 text-xs text-muted-foreground">
            <span>{s.title}</span>
            <span className="tabular-nums font-medium text-card-foreground">{s.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(s.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OutcomeFunnel({ seven, thirty }: OutcomeFunnelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Outcome funnel</h3>
      <p className="mt-1 mb-4 text-xs text-muted-foreground leading-relaxed">
        Activity by timestamp: ingested = opportunities created in the window; applied = rows with{" "}
        <code className="text-[11px]">appliedAt</code> in the window (can include jobs ingested
        earlier). Disqualified = <code className="text-[11px]">rejections</code> created in the
        window. Does <strong className="font-medium text-foreground/80">not</strong> include
        in-app “Disqualify” on an opportunity unless a rejection row is written.
      </p>
      <div className="grid gap-8 sm:grid-cols-2">
        <FunnelColumn label="Last 7 days" data={seven} />
        <FunnelColumn label="Last 30 days" data={thirty} />
      </div>
    </div>
  );
}
