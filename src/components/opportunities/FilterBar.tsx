"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const sources = ["All", "Adzuna", "Reed", "JSearch", "ATS", "RSS"];
const statuses = ["All", "new", "reviewed", "applied", "rejected", "archived"];
const workingModels = ["All", "Remote", "Hybrid", "On-site", "Unknown"];
const listingTypes = ["All", "Direct", "Recruiter"];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "All" || value === "") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.set("page", "1");
      return params.toString();
    },
    [searchParams]
  );

  function handleChange(name: string, value: string) {
    router.push(`/opportunities?${createQueryString(name, value)}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={searchParams.get("source") || "All"}
        onChange={(e) => handleChange("source", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
        aria-label="Filter by source"
      >
        {sources.map((s) => (
          <option key={s} value={s}>{s === "All" ? "All Sources" : s}</option>
        ))}
      </select>

      <select
        value={searchParams.get("status") || "All"}
        onChange={(e) => handleChange("status", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
        aria-label="Filter by status"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
        ))}
      </select>

      <select
        value={searchParams.get("workingModel") || "All"}
        onChange={(e) => handleChange("workingModel", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
        aria-label="Filter by working model"
      >
        {workingModels.map((s) => (
          <option key={s} value={s}>{s === "All" ? "All Models" : s}</option>
        ))}
      </select>

      <select
        value={searchParams.get("listingType") || "All"}
        onChange={(e) => handleChange("listingType", e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
        aria-label="Filter by listing type"
      >
        {listingTypes.map((s) => (
          <option key={s} value={s}>{s === "All" ? "All Types" : s}</option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        max="10"
        placeholder="Min score"
        defaultValue={searchParams.get("score_min") || ""}
        onChange={(e) => handleChange("score_min", e.target.value)}
        className="w-24 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
        aria-label="Minimum score"
      />
    </div>
  );
}
