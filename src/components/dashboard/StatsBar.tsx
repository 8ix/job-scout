interface StatsBarProps {
  stats: {
    totalOpportunities: number;
    totalRejections: number;
    applied: number;
    conversionRate: number;
  };
}

const cards = [
  { key: "totalOpportunities" as const, label: "Opportunities", format: (v: number) => String(v) },
  { key: "totalRejections" as const, label: "Rejections", format: (v: number) => String(v) },
  { key: "applied" as const, label: "Applied", format: (v: number) => String(v) },
  { key: "conversionRate" as const, label: "Conversion Rate", format: (v: number) => `${(v * 100).toFixed(1)}%` },
];

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
