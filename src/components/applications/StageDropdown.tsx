"use client";

import { applicationStageLabel } from "@/lib/ui/stage-labels";

const STAGES = ["Applied", "Screening", "Interview", "Final Round", "Offer", "Rejected", "Archived"] as const;

interface StageDropdownProps {
  opportunityId: string;
  value: string;
  onUpdated: () => void;
}

export function StageDropdown({ opportunityId, value, onUpdated }: StageDropdownProps) {
  async function handleChange(newStage: string) {
    const res = await fetch(`/api/opportunities/${opportunityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (!res.ok) return;
    onUpdated();
  }

  return (
    <select
      value={value ?? "Applied"}
      onChange={(e) => handleChange(e.target.value as typeof STAGES[number])}
      className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-card-foreground"
      aria-label="Update stage"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {applicationStageLabel(s)}
        </option>
      ))}
    </select>
  );
}
