interface ScoreChartProps {
  byScore: { band: string; count: number }[];
}

const bandColors: Record<string, string> = {
  "0-3": "bg-danger",
  "4-6": "bg-warning",
  "7-10": "bg-success",
};

export function ScoreChart({ byScore }: ScoreChartProps) {
  const maxCount = Math.max(...byScore.map((b) => b.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Score Distribution</h3>
      {byScore.length === 0 ? (
        <p className="text-sm text-muted-foreground">No score data available yet.</p>
      ) : (
        <div className="space-y-3">
          {byScore.map((band) => (
            <div key={band.band} className="flex items-center gap-3">
              <span className="w-12 text-sm text-muted-foreground">{band.band}</span>
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
