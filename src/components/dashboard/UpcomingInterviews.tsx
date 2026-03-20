import Link from "next/link";

export interface UpcomingInterviewRow {
  id: string;
  kind: string;
  scheduledAt: string;
  notes: string | null;
  company: string;
  title: string;
  opportunityId: string;
}

interface UpcomingInterviewsProps {
  events: UpcomingInterviewRow[];
}

export function UpcomingInterviews({ events }: UpcomingInterviewsProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-card-foreground">Upcoming</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No screening calls or interviews scheduled in the next two weeks.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add dates from <strong>Details</strong> on the Applications page.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col min-h-0">
      <h3 className="text-lg font-semibold text-card-foreground shrink-0">Upcoming</h3>
      <p className="text-xs text-muted-foreground mb-3 shrink-0">
        Screening & interviews in the next 14 days
      </p>
      <ul className="space-y-0 max-h-[min(24rem,50vh)] overflow-y-auto min-h-0 -mx-1 px-1">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="grid grid-cols-1 gap-2 border-b border-border py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4 sm:items-start"
          >
            <div className="min-w-0">
              <p className="font-medium text-card-foreground truncate" title={ev.company}>
                {ev.company}
              </p>
              <p className="text-sm text-muted-foreground truncate" title={ev.title}>
                {ev.title}
              </p>
              <p className="text-xs capitalize text-primary mt-0.5">{ev.kind}</p>
              {ev.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={ev.notes ?? ""}>
                  {ev.notes}
                </p>
              )}
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:items-end sm:text-right shrink-0">
              <time
                className="text-sm text-card-foreground whitespace-nowrap tabular-nums"
                dateTime={ev.scheduledAt}
              >
                {new Date(ev.scheduledAt).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
              <Link
                href={`/applications/${ev.opportunityId}/edit`}
                className="text-xs text-primary hover:underline whitespace-nowrap text-left sm:text-right"
              >
                View application
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
