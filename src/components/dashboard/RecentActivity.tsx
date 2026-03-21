interface RecentActivityProps {
  activity: {
    date: string;
    opportunities: number;
    rejected: number;
    jobsProcessed: number;
  }[];
}

const BAR_MAX_HEIGHT = 96;

export function RecentActivity({ activity }: RecentActivityProps) {
  const maxBar = Math.max(
    ...activity.flatMap((a) => [a.opportunities, a.rejected]),
    1
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Recent Activity (14 days)
      </h3>
      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="flex items-end gap-1 h-40">
          {activity.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="w-full flex gap-0.5 items-end" style={{ height: "96px" }}>
                <div
                  className="flex-1 bg-success rounded-sm transition-all min-w-[4px] flex flex-col justify-end items-center overflow-hidden shrink-0"
                  style={{
                    height: maxBar > 0 ? `${(day.opportunities / maxBar) * BAR_MAX_HEIGHT}px` : "0px",
                    minHeight: day.opportunities > 0 ? "4px" : "0px",
                  }}
                  title={`Opportunities: ${day.opportunities}`}
                >
                  {day.opportunities > 0 && (
                    <span className="text-[9px] font-medium text-white drop-shadow-sm leading-tight">
                      {day.opportunities}
                    </span>
                  )}
                </div>
                <div
                  className="flex-1 bg-danger rounded-sm transition-all min-w-[4px] flex flex-col justify-end items-center overflow-hidden shrink-0"
                  style={{
                    height: maxBar > 0 ? `${(day.rejected / maxBar) * BAR_MAX_HEIGHT}px` : "0px",
                    minHeight: day.rejected > 0 ? "4px" : "0px",
                  }}
                  title={`Disqualified: ${day.rejected}`}
                >
                  {day.rejected > 0 && (
                    <span className="text-[9px] font-medium text-white drop-shadow-sm leading-tight">
                      {day.rejected}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground text-center truncate w-full">
                {day.jobsProcessed} jobs
              </span>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {new Date(day.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
