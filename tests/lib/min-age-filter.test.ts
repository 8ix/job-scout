import { describe, it, expect } from "vitest";
import {
  parseMinAgeDays,
  createdAtLteForMinAgeDays,
} from "@/lib/opportunities/min-age-filter";

describe("parseMinAgeDays", () => {
  it("returns null for empty or invalid", () => {
    expect(parseMinAgeDays(undefined)).toBeNull();
    expect(parseMinAgeDays("")).toBeNull();
    expect(parseMinAgeDays("0")).toBeNull();
    expect(parseMinAgeDays("-1")).toBeNull();
    expect(parseMinAgeDays("abc")).toBeNull();
  });

  it("parses positive integers", () => {
    expect(parseMinAgeDays("7")).toBe(7);
    expect(parseMinAgeDays("1")).toBe(1);
  });
});

describe("createdAtLteForMinAgeDays", () => {
  it("returns UTC start of day N days before now", () => {
    const now = new Date("2026-03-20T15:30:00.000Z");
    const d = createdAtLteForMinAgeDays(7, now);
    expect(d.toISOString()).toBe("2026-03-13T00:00:00.000Z");
  });
});
