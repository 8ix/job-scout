interface ScoreChartProps {
  byScore: { band: string; count: number }[];
}

const bandColors: Record<string, string> = {
  "6": "bg-warning",
  "7": "bg-warning",
  "8": "bg-success",
  "9": "bg-success",
  "10": "bg-success",
};

export function ScoreChart({ byScore }: ScoreChartProps) {
  const maxCount = Math.max(...byScore.map((b) => b.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Score Distribution</h3>
      <p className="mt-1 mb-4 text-xs text-muted-foreground leading-relaxed">
        <strong className="font-medium text-foreground/80">Incoming</strong> scores 6–10 only:
        each job is counted once using the score from ingestion (opportunities in any status, plus
        disqualified-only listings that never had an opportunity row). Anything scored{" "}
        <strong className="font-medium text-foreground/80">5 or below</strong> is usually your
        baseline for disqualification—we hide that band here so the chart stays readable as volume
        grows. The sidebar{" "}
        <strong className="font-medium text-foreground/80">Disqualified</strong> page is the full
        list of rejections (can overlap when the same job also has an opportunity).
      </p>
      {byScore.length === 0 ? (
        <p className="text-sm text-muted-foreground">No score data available yet.</p>
      ) : (
        <div className="space-y-3">
          {byScore.map((band) => (
            <div key={band.band} className="flex items-center gap-3">
              <span className="w-20 text-sm text-muted-foreground">{band.band}</span>
              <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                <div
                  className={`h-full ${bandColors[band.band] || "bg-primary"} rounded-md transition-all`}
                  style={{ width: `${(band.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-medium text-card-foreground">
                {band.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
