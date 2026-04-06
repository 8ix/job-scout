import { describe, it, expect } from "vitest";
import { normalizeRoleMatchKey } from "@/lib/opportunities/normalize-role-match";

describe("normalizeRoleMatchKey", () => {
  it("lowercases and trims title and company", () => {
    expect(normalizeRoleMatchKey("Senior Dev", "Acme Corp")).toBe(
      normalizeRoleMatchKey("senior dev", "acme corp")
    );
  });

  it("collapses internal whitespace", () => {
    expect(normalizeRoleMatchKey("Senior  Dev", "Acme  Corp")).toBe(
      normalizeRoleMatchKey("Senior Dev", "Acme Corp")
    );
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeRoleMatchKey("  Senior Dev  ", " Acme Corp ")).toBe(
      normalizeRoleMatchKey("Senior Dev", "Acme Corp")
    );
  });

  it("distinguishes different titles at the same company", () => {
    expect(normalizeRoleMatchKey("Frontend Dev", "Acme")).not.toBe(
      normalizeRoleMatchKey("Backend Dev", "Acme")
    );
  });

  it("distinguishes the same title at different companies", () => {
    expect(normalizeRoleMatchKey("Senior Dev", "Acme")).not.toBe(
      normalizeRoleMatchKey("Senior Dev", "Globex")
    );
  });
});
