import { describe, it, expect } from "vitest";
import { isMobileUserAgent } from "@/lib/mobile-user-agent";

describe("isMobileUserAgent", () => {
  it("returns false for null/undefined/empty", () => {
    expect(isMobileUserAgent(null)).toBe(false);
    expect(isMobileUserAgent(undefined)).toBe(false);
    expect(isMobileUserAgent("")).toBe(false);
  });

  it("detects iPhone Safari", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
      )
    ).toBe(true);
  });

  it("detects Android phone", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36"
      )
    ).toBe(true);
  });

  it("returns false for desktop Chrome", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
      )
    ).toBe(false);
  });
});
