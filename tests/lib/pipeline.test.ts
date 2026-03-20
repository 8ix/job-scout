import { describe, it, expect } from "vitest";
import {
  assignPipelineBand,
  groupApplicationsByPipelineBand,
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

  it("assigns Applied with only past events to quiet", () => {
    expect(
      assignPipelineBand("Applied", [{ scheduledAt: past(1) }], now)
    ).toBe("quiet");
  });

  it("assigns Screening without upcoming to quiet", () => {
    expect(assignPipelineBand("Screening", [], now)).toBe("quiet");
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
    expect(groups.map((g) => g.band)).toEqual(["Offer", "Applied", "quiet"]);
    expect(groups[0].applications.map((a) => a.id)).toEqual(["1"]);
    expect(groups[1].applications.map((a) => a.id)).toEqual(["2"]);
    expect(groups[2].applications.map((a) => a.id)).toEqual(["3"]);
  });

  it("countDistinctStages", () => {
    expect(
      countDistinctStages([{ stage: "Applied" }, { stage: null }, { stage: "Interview" }])
    ).toBe(2);
  });
});
