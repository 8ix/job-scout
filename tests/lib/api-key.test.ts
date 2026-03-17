import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateApiKey } from "@/lib/auth/api-key";

describe("validateApiKey", () => {
  beforeEach(() => {
    vi.stubEnv("API_KEY", "test-secret-key");
  });

  it("returns true for a valid API key", () => {
    const headers = new Headers({ "X-API-Key": "test-secret-key" });
    expect(validateApiKey(headers)).toBe(true);
  });

  it("returns false for an invalid API key", () => {
    const headers = new Headers({ "X-API-Key": "wrong-key" });
    expect(validateApiKey(headers)).toBe(false);
  });

  it("returns false when no API key header is present", () => {
    const headers = new Headers();
    expect(validateApiKey(headers)).toBe(false);
  });

  it("returns false when API_KEY env var is not set", () => {
    vi.stubEnv("API_KEY", "");
    const headers = new Headers({ "X-API-Key": "test-secret-key" });
    expect(validateApiKey(headers)).toBe(false);
  });
});
