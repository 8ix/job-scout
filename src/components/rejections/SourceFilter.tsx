"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SourceFilterProps {
  sources: string[];
}

export function SourceFilter({ sources }: SourceFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceOptions = ["All", ...sources];

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
      {sourceOptions.map((s) => (
        <option key={s} value={s}>
          {s === "All" ? "All Sources" : s}
        </option>
      ))}
    </select>
  );
}
