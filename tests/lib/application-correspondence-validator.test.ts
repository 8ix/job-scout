import { describe, it, expect } from "vitest";
import { createApplicationCorrespondenceSchema } from "@/lib/validators/application-correspondence";

describe("createApplicationCorrespondenceSchema", () => {
  it("accepts valid payload", () => {
    const r = createApplicationCorrespondenceSchema.safeParse({
      receivedAt: "2026-01-15T14:30:00.000Z",
      body: "Thank you for your application.",
      subject: "Acknowledgement",
    });
    expect(r.success).toBe(true);
  });

  it("maps empty subject to null", () => {
    const r = createApplicationCorrespondenceSchema.safeParse({
      receivedAt: "2026-01-15T14:30:00.000Z",
      body: "Hi",
      subject: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.subject).toBeNull();
  });

  it("rejects empty body", () => {
    const r = createApplicationCorrespondenceSchema.safeParse({
      receivedAt: "2026-01-15T14:30:00.000Z",
      body: "  ",
    });
    expect(r.success).toBe(false);
  });
});
