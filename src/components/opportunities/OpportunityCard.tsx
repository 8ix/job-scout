"use client";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string | null;
  score: number;
  verdict: string;
  matchReasons: string | null;
  redFlags: string | null;
  url: string;
  source: string;
  workingModel: string | null;
  listingType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: string;
  createdAt: string | Date;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStatusChange: (id: string, status: string) => void;
}

function scoreBadgeColor(score: number): string {
  if (score >= 7) return "bg-success text-white";
  if (score >= 4) return "bg-warning text-white";
  return "bg-danger text-white";
}

export function OpportunityCard({ opportunity, onStatusChange }: OpportunityCardProps) {
  const opp = opportunity;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h3 className="text-base font-semibold text-card-foreground truncate">{opp.title}</h3>
          <p className="text-sm text-muted-foreground">{opp.company}</p>
          {opp.location && (
            <p className="text-sm text-muted-foreground">{opp.location}</p>
          )}
        </div>
        <span className={`shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${scoreBadgeColor(opp.score)}`}>
          {opp.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">{opp.verdict}</span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">{opp.source}</span>
        {opp.workingModel && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">{opp.workingModel}</span>
        )}
        {opp.listingType && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">{opp.listingType}</span>
        )}
        {opp.salaryMin != null && opp.salaryMax != null && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
            £{opp.salaryMin.toLocaleString()}–£{opp.salaryMax.toLocaleString()}
          </span>
        )}
      </div>

      {opp.matchReasons && (
        <div className="text-sm">
          <span className="font-medium text-success">Match: </span>
          <span className="text-card-foreground">{opp.matchReasons}</span>
        </div>
      )}

      {opp.redFlags && (
        <div className="text-sm">
          <span className="font-medium text-danger">Flags: </span>
          <span className="text-card-foreground">{opp.redFlags}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <a
          href={opp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          View listing
        </a>
        {opp.status === "new" && (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(opp.id, "applied")}
              className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/90 transition-colors"
            >
              Applied
            </button>
            <button
              onClick={() => onStatusChange(opp.id, "rejected")}
              className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger/90 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
