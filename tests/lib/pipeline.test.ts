import { describe, it, expect } from "vitest";
import {
  assignPipelineBand,
  groupApplicationsByPipelineBand,
  groupApplicationsByPipelineBandWithStale,
  isStaleIdleApplication,
  normalizeApplicationStage,
  countDistinctStages,
} from "@/lib/applications/pipeline";

describe("pipeline", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const future = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  const past = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  it("normalizes empty stage to Applied", () => {
    expect(normalizeApplicationStage(null)).toBe("Applied");
    expect(normalizeApplicationStage("")).toBe("Applied");
  });

  it("assigns Offer to Offer band regardless of events", () => {
    expect(
      assignPipelineBand("Offer", [], now)
    ).toBe("Offer");
  });

  it("assigns Applied with future event to Applied band", () => {
    expect(
      assignPipelineBand("Applied", [{ scheduledAt: future(1) }], now)
    ).toBe("Applied");
  });

  it("assigns Applied with only past events to appliedWaiting", () => {
    expect(
      assignPipelineBand("Applied", [{ scheduledAt: past(1) }], now)
    ).toBe("appliedWaiting");
  });

  it("assigns Screening without upcoming to screeningWaiting", () => {
    expect(assignPipelineBand("Screening", [], now)).toBe("screeningWaiting");
  });

  it("places screeningWaiting above appliedWaiting (heat order)", () => {
    const apps = [
      {
        id: "ap",
        stage: "Applied",
        appliedAt: "2026-01-01T00:00:00.000Z",
        scheduledEvents: [] as { scheduledAt: string }[],
      },
      {
        id: "sc",
        stage: "Screening",
        appliedAt: "2026-01-02T00:00:00.000Z",
        scheduledEvents: [] as { scheduledAt: string }[],
      },
    ];
    const groups = groupApplicationsByPipelineBand(apps, now);
    expect(groups.map((g) => g.band)).toEqual(["screeningWaiting", "appliedWaiting"]);
    expect(groups[0].applications.map((a) => a.id)).toEqual(["sc"]);
    expect(groups[1].applications.map((a) => a.id)).toEqual(["ap"]);
  });

  it("groups bands in heat order with non-empty bands only", () => {
    const apps = [
      {
        id: "1",
        stage: "Offer",
        appliedAt: "2026-01-01T00:00:00.000Z",
        scheduledEvents: [] as { scheduledAt: string }[],
      },
      {
        id: "2",
        stage: "Applied",
        appliedAt: "2026-02-01T00:00:00.000Z",
        scheduledEvents: [{ scheduledAt: future(2) }],
      },
      {
        id: "3",
        stage: "Applied",
        appliedAt: "2026-03-01T00:00:00.000Z",
        scheduledEvents: [],
      },
    ];
    const groups = groupApplicationsByPipelineBand(apps, now);
    expect(groups.map((g) => g.band)).toEqual(["Offer", "Applied", "appliedWaiting"]);
    expect(groups[0].applications.map((a) => a.id)).toEqual(["1"]);
    expect(groups[1].applications.map((a) => a.id)).toEqual(["2"]);
    expect(groups[2].applications.map((a) => a.id)).toEqual(["3"]);
  });

  it("countDistinctStages", () => {
    expect(
      countDistinctStages([{ stage: "Applied" }, { stage: null }, { stage: "Interview" }])
    ).toBe(2);
  });

  it("isStaleIdleApplication when old apply and no upcoming events", () => {
    expect(
      isStaleIdleApplication(
        { appliedAt: past(70), scheduledEvents: [] },
        now
      )
    ).toBe(true);
    expect(
      isStaleIdleApplication(
        { appliedAt: past(70), scheduledEvents: [{ scheduledAt: future(1) }] },
        now
      )
    ).toBe(false);
    expect(
      isStaleIdleApplication(
        { appliedAt: past(30), scheduledEvents: [] },
        now
      )
    ).toBe(false);
  });

  it("groupApplicationsByPipelineBandWithStale moves stale idle apps to last section only", () => {
    const apps = [
      {
        id: "fresh-quiet",
        stage: "Applied" as const,
        appliedAt: past(10),
        scheduledEvents: [] as { scheduledAt: string }[],
      },
      {
        id: "stale-idle",
        stage: "Applied" as const,
        appliedAt: past(65),
        scheduledEvents: [] as { scheduledAt: string }[],
      },
      {
        id: "old-but-interview",
        stage: "Applied" as const,
        appliedAt: past(65),
        scheduledEvents: [{ scheduledAt: future(1) }],
      },
    ];
    const groups = groupApplicationsByPipelineBandWithStale(apps, now);
    expect(groups.map((g) => g.band)).toEqual(["Applied", "appliedWaiting", "stale"]);
    expect(groups[0].applications.map((a) => a.id)).toEqual(["old-but-interview"]);
    expect(groups[1].applications.map((a) => a.id)).toEqual(["fresh-quiet"]);
    expect(groups[2].applications.map((a) => a.id)).toEqual(["stale-idle"]);
    expect(groups[0].applications.some((a) => a.id === "stale-idle")).toBe(false);
    expect(groups[1].applications.some((a) => a.id === "stale-idle")).toBe(false);
  });
});
