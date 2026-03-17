interface Rejection {
  id: string;
  title: string;
  company: string | null;
  source: string;
  score: number;
  redFlags: string | null;
  url: string;
  createdAt: string | Date;
}

interface RejectionCardProps {
  rejection: Rejection;
}

export function RejectionCard({ rejection }: RejectionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h3 className="text-base font-semibold text-card-foreground truncate">
            {rejection.title}
          </h3>
          {rejection.company && (
            <p className="text-sm text-muted-foreground">{rejection.company}</p>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold bg-danger text-white">
          {rejection.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
          {rejection.source}
        </span>
      </div>

      {rejection.redFlags && (
        <div className="text-sm">
          <span className="font-medium text-danger">Flags: </span>
          <span className="text-card-foreground">{rejection.redFlags}</span>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <a
          href={rejection.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          View listing
        </a>
      </div>
    </div>
  );
}
