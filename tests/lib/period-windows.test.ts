import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getCurrentMonthBounds, getPreviousMonthBounds } from "@/lib/goals/monthly-window";
import { getCurrentWeekBounds, getPreviousWeekBounds } from "@/lib/goals/weekly-window";

describe("weekly-window (UTC)", () => {
  const tz = "UTC";

  it("current week Monday start contains a Wednesday in March 2025", () => {
    const now = new Date("2025-03-12T12:00:00.000Z");
    const { startUtc, endUtc } = getCurrentWeekBounds(now, 1, tz);
    expect(startUtc.toISOString()).toBe("2025-03-10T00:00:00.000Z");
    expect(endUtc.toISOString()).toBe("2025-03-17T00:00:00.000Z");
    expect(now >= startUtc && now < endUtc).toBe(true);
  });

  it("previous week is the seven days before current week start", () => {
    const now = new Date("2025-03-12T12:00:00.000Z");
    const prev = getPreviousWeekBounds(now, 1, tz);
    expect(prev.startUtc.toISOString()).toBe("2025-03-03T00:00:00.000Z");
    expect(prev.endUtc.toISOString()).toBe("2025-03-10T00:00:00.000Z");
  });

  it("weekStartsOn Sunday shifts boundaries", () => {
    const now = new Date("2025-03-12T12:00:00.000Z"); // Wednesday
    const { startUtc, endUtc } = getCurrentWeekBounds(now, 0, tz);
    expect(startUtc.toISOString()).toBe("2025-03-09T00:00:00.000Z");
    expect(endUtc.toISOString()).toBe("2025-03-16T00:00:00.000Z");
  });
});

describe("monthly-window (UTC)", () => {
  const tz = "UTC";

  it("current month is calendar month half-open", () => {
    const now = new Date("2025-03-15T12:00:00.000Z");
    const { startUtc, endUtc } = getCurrentMonthBounds(now, tz);
    expect(startUtc.toISOString()).toBe("2025-03-01T00:00:00.000Z");
    expect(endUtc.toISOString()).toBe("2025-04-01T00:00:00.000Z");
  });

  it("previous month is February when current is March", () => {
    const now = new Date("2025-03-01T00:30:00.000Z");
    const prev = getPreviousMonthBounds(now, tz);
    expect(prev.startUtc.toISOString()).toBe("2025-02-01T00:00:00.000Z");
    expect(prev.endUtc.toISOString()).toBe("2025-03-01T00:00:00.000Z");
  });

  it("March 1 boundary: current month is March", () => {
    const now = new Date("2025-03-01T00:00:00.000Z");
    const cur = getCurrentMonthBounds(now, tz);
    expect(cur.startUtc.toISOString()).toBe("2025-03-01T00:00:00.000Z");
    expect(cur.endUtc.toISOString()).toBe("2025-04-01T00:00:00.000Z");
  });
});

describe("weekly-window (Europe/London)", () => {
  const origTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  afterAll(() => {
    if (origTz === undefined) delete process.env.TZ;
    else process.env.TZ = origTz;
  });

  it("uses London wall calendar for week start in winter (GMT)", () => {
    const now = new Date("2025-03-12T12:00:00.000Z");
    const { startUtc, endUtc } = getCurrentWeekBounds(now, 1, "Europe/London");
    expect(startUtc.toISOString()).toBe("2025-03-10T00:00:00.000Z");
    expect(endUtc.toISOString()).toBe("2025-03-17T00:00:00.000Z");
  });
});
