"use client";

import { useRouter } from "next/navigation";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string | null;
  score: number;
  verdict: string | null;
  url: string | null;
  source: string;
  status: string;
}

interface MobileOpportunityListProps {
  opportunities: Opportunity[];
}

function scoreBadgeColor(score: number): string {
  if (score >= 7) return "bg-success text-white";
  if (score >= 4) return "bg-warning text-white";
  return "bg-danger text-white";
}

export function MobileOpportunityList({ opportunities }: MobileOpportunityListProps) {
  const router = useRouter();

  async function handleStatusChange(id: string, status: string) {
    const body: Record<string, unknown> = { status };
    if (status === "applied") {
      body.appliedVia = "Job Scout";
    }
    await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  if (opportunities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No new opportunities to review right now.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4" data-testid="mobile-opportunity-list">
      {opportunities.map((opp) => (
        <li
          key={opp.id}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-card-foreground leading-snug">
                {opp.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{opp.company}</p>
              {opp.location && (
                <p className="mt-0.5 text-xs text-muted-foreground">{opp.location}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{opp.source}</p>
            </div>
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${scoreBadgeColor(opp.score)}`}
            >
              {opp.score}
            </span>
          </div>

          {opp.verdict && (
            <p className="mt-2 text-xs text-muted-foreground">{opp.verdict}</p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {opp.url ? (
              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-center rounded-lg border border-primary bg-transparent px-4 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                View listing
              </a>
            ) : (
              <span className="flex min-h-11 items-center justify-center rounded-lg border border-dashed border-border px-4 text-sm text-muted-foreground">
                No listing URL
              </span>
            )}
            {opp.status === "new" && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange(opp.id, "applied")}
                  className="min-h-11 rounded-lg bg-success px-4 text-sm font-semibold text-white hover:bg-success/90 active:scale-[0.98]"
                >
                  Applied
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(opp.id, "rejected")}
                  className="min-h-11 rounded-lg bg-danger px-4 text-sm font-semibold text-white hover:bg-danger/90 active:scale-[0.98]"
                  aria-label="Disqualify this opportunity"
                >
                  Disqualify
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
