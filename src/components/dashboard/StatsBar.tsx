interface StatsBarProps {
  stats: {
    totalOpportunities: number;
    /** Workflow disqualified (rejections), excluding ingest blocklist rows. */
    workflowRejections: number;
    /** Server ingest blocklist (rejections with a block pattern). */
    blockedRejections: number;
    applied: number;
    conversionRate: number;
  };
}

const cards = [
  { key: "totalOpportunities" as const, label: "Opportunities", format: (v: number) => String(v) },
  {
    key: "workflowRejections" as const,
    label: "Disqualified (workflow)",
    format: (v: number) => String(v),
  },
  {
    key: "blockedRejections" as const,
    label: "Blocked (ingest list)",
    format: (v: number) => String(v),
  },
  { key: "applied" as const, label: "Applied", format: (v: number) => String(v) },
  { key: "conversionRate" as const, label: "% Applied", format: (v: number) => `${(v * 100).toFixed(1)}%` },
];

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-border bg-card p-6"
        >
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-3xl font-bold text-card-foreground">
            {card.format(stats[card.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
