interface RecentActivityProps {
  activity: { date: string; count: number }[];
}

export function RecentActivity({ activity }: RecentActivityProps) {
  const maxCount = Math.max(...activity.map((a) => a.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Recent Activity (14 days)
      </h3>
      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="flex items-end gap-1 h-32">
          {activity.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end h-24">
                <div
                  className="w-full bg-primary rounded-sm transition-all min-h-[2px]"
                  style={{ height: `${(day.count / maxCount) * 100}%` }}
                  title={`${day.date}: ${day.count} jobs`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {new Date(day.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
