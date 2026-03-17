"use client";

import { useRouter, useSearchParams } from "next/navigation";

const sources = ["All", "Adzuna", "Reed", "JSearch", "ATS", "RSS"];

export function SourceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") {
      params.delete("source");
    } else {
      params.set("source", value);
    }
    params.set("page", "1");
    router.push(`/rejections?${params.toString()}`);
  }

  return (
    <select
      value={searchParams.get("source") || "All"}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
      aria-label="Filter by source"
    >
      {sources.map((s) => (
        <option key={s} value={s}>
          {s === "All" ? "All Sources" : s}
        </option>
      ))}
    </select>
  );
}
