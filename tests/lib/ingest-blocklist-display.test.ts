import { describe, it, expect } from "vitest";
import { ingestBlocklistScopeLabel } from "@/lib/rejections/ingest-blocklist-display";

describe("ingestBlocklistScopeLabel", () => {
  it("maps known scopes", () => {
    expect(ingestBlocklistScopeLabel("company")).toContain("Company");
    expect(ingestBlocklistScopeLabel("title")).toContain("title");
    expect(ingestBlocklistScopeLabel("any")).toContain("Any field");
  });
});
