"use client";

import { useRouter } from "next/navigation";
import { OpportunityCard } from "./OpportunityCard";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string | null;
  score: number;
  verdict: string | null;
  matchReasons: string | null;
  redFlags: string | null;
  url: string | null;
  source: string;
  workingModel: string | null;
  listingType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: string;
  createdAt: string | Date;
}

interface OpportunityListProps {
  opportunities: Opportunity[];
}

export function OpportunityList({ opportunities }: OpportunityListProps) {
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
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No opportunities match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {opportunities.map((opp) => (
        <OpportunityCard
          key={opp.id}
          opportunity={opp}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
