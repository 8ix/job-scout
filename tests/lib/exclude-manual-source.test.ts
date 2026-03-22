import { describe, it, expect } from "vitest";
import { excludeManualSource } from "@/lib/feeds/exclude-manual-source";

describe("excludeManualSource", () => {
  it("removes rows whose source is manual", () => {
    const rows = [
      { source: "adzuna", n: 1 },
      { source: "manual", n: 2 },
      { source: "reed", n: 3 },
    ];
    expect(excludeManualSource(rows)).toEqual([
      { source: "adzuna", n: 1 },
      { source: "reed", n: 3 },
    ]);
  });
});
