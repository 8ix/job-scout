import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config: { authorize: Function }) => config),
}));

describe("NextAuth credentials authorize", () => {
  beforeEach(() => {
    vi.stubEnv("DASHBOARD_USERNAME", "admin");
    vi.stubEnv("DASHBOARD_PASSWORD", "secret123");
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
    vi.resetModules();
  });

  async function getAuthorize() {
    const { authOptions } = await import("@/lib/auth/session");
    const provider = authOptions.providers[0] as unknown as {
      authorize: (creds: { username: string; password: string }) => Promise<{ id: string; name: string } | null>;
    };
    return provider.authorize;
  }

  it("returns user for valid credentials", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ username: "admin", password: "secret123" });
    expect(result).toEqual({ id: "1", name: "admin" });
  });

  it("returns null for wrong username", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ username: "wrong", password: "secret123" });
    expect(result).toBeNull();
  });

  it("returns null for wrong password", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ username: "admin", password: "wrongpass" });
    expect(result).toBeNull();
  });

  it("returns null when credentials are empty", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ username: "", password: "" });
    expect(result).toBeNull();
  });

  it("uses jwt session strategy", async () => {
    const { authOptions } = await import("@/lib/auth/session");
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("redirects to /login page", async () => {
    const { authOptions } = await import("@/lib/auth/session");
    expect(authOptions.pages?.signIn).toBe("/login");
  });
});
