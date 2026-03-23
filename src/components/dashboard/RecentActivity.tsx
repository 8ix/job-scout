interface RecentActivityProps {
  activity: {
    date: string;
    opportunities: number;
    workflowRejected: number;
    blocked: number;
    jobsProcessed: number;
  }[];
}

const BAR_MAX_HEIGHT = 96;

export function RecentActivity({ activity }: RecentActivityProps) {
  const maxBar = Math.max(
    ...activity.flatMap((a) => [a.opportunities, a.workflowRejected, a.blocked]),
    1
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        Recent Activity (14 days)
      </h3>
      <p className="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          <span className="inline-block h-2 w-2 rounded-sm bg-success align-middle mr-1" />
          Opportunities
        </span>
        <span>
          <span className="inline-block h-2 w-2 rounded-sm bg-danger align-middle mr-1" />
          Disqualified (workflow)
        </span>
        <span>
          <span className="inline-block h-2 w-2 rounded-sm bg-amber-500 align-middle mr-1" />
          Blocked (ingest list)
        </span>
      </p>
      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="flex items-end gap-1 h-40">
          {activity.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="w-full flex gap-0.5 items-end" style={{ height: "96px" }}>
                <div
                  className="flex-1 bg-success rounded-sm transition-all min-w-[3px] flex flex-col justify-end items-center overflow-hidden shrink-0"
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
                  className="flex-1 bg-danger rounded-sm transition-all min-w-[3px] flex flex-col justify-end items-center overflow-hidden shrink-0"
                  style={{
                    height:
                      maxBar > 0 ? `${(day.workflowRejected / maxBar) * BAR_MAX_HEIGHT}px` : "0px",
                    minHeight: day.workflowRejected > 0 ? "4px" : "0px",
                  }}
                  title={`Disqualified (workflow): ${day.workflowRejected}`}
                >
                  {day.workflowRejected > 0 && (
                    <span className="text-[9px] font-medium text-white drop-shadow-sm leading-tight">
                      {day.workflowRejected}
                    </span>
                  )}
                </div>
                <div
                  className="flex-1 bg-amber-500 rounded-sm transition-all min-w-[3px] flex flex-col justify-end items-center overflow-hidden shrink-0"
                  style={{
                    height: maxBar > 0 ? `${(day.blocked / maxBar) * BAR_MAX_HEIGHT}px` : "0px",
                    minHeight: day.blocked > 0 ? "4px" : "0px",
                  }}
                  title={`Blocked (ingest list): ${day.blocked}`}
                >
                  {day.blocked > 0 && (
                    <span className="text-[9px] font-medium text-white drop-shadow-sm leading-tight">
                      {day.blocked}
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
