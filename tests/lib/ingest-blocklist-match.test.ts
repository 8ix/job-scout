import { describe, it, expect } from "vitest";
import { findMatchingIngestBlockRule } from "@/lib/ingest-blocklist/match";

describe("findMatchingIngestBlockRule", () => {
  const payload = {
    company: "Acme Recruiting Ltd",
    title: "Senior Developer",
    description: "Contact Jane Doe for details.",
  };

  it("matches company scope case-insensitively", () => {
    const hit = findMatchingIngestBlockRule(payload, [
      { id: "1", pattern: "acme recruiting", scope: "company" },
    ]);
    expect(hit?.id).toBe("1");
  });

  it("does not match company pattern in title only", () => {
    const hit = findMatchingIngestBlockRule(
      { company: "Other Co", title: "Acme Recruiting posted this", description: null },
      [{ id: "1", pattern: "acme recruiting", scope: "company" }]
    );
    expect(hit).toBeNull();
  });

  it("matches title scope", () => {
    const hit = findMatchingIngestBlockRule(payload, [
      { id: "2", pattern: "senior dev", scope: "title" },
    ]);
    expect(hit?.id).toBe("2");
  });

  it("matches any scope in description when not in company/title", () => {
    const hit = findMatchingIngestBlockRule(payload, [
      { id: "3", pattern: "jane doe", scope: "any" },
    ]);
    expect(hit?.id).toBe("3");
  });

  it("treats missing description as empty for any scope", () => {
    const hit = findMatchingIngestBlockRule(
      { company: "X", title: "Y", description: undefined },
      [{ id: "4", pattern: "zzz", scope: "any" }]
    );
    expect(hit).toBeNull();
  });

  it("returns first matching rule in list order", () => {
    const hit = findMatchingIngestBlockRule(payload, [
      { id: "a", pattern: "Acme", scope: "company" },
      { id: "b", pattern: "Acme", scope: "company" },
    ]);
    expect(hit?.id).toBe("a");
  });

  it("skips empty patterns", () => {
    const hit = findMatchingIngestBlockRule(payload, [
      { id: "x", pattern: "   ", scope: "company" },
      { id: "y", pattern: "Acme", scope: "company" },
    ]);
    expect(hit?.id).toBe("y");
  });
});
