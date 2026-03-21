import { describe, it, expect } from "vitest";
import {
  orderPipelineSnapshotCounts,
  mapGroupByToStageCounts,
} from "@/lib/stats/pipeline-snapshot";

describe("mapGroupByToStageCounts", () => {
  it("coalesces null stage to Applied", () => {
    const m = mapGroupByToStageCounts([
      { stage: null, _count: { id: 3 } },
      { stage: "Interview", _count: { id: 2 } },
    ]);
    expect(m.get("Applied")).toBe(3);
    expect(m.get("Interview")).toBe(2);
  });

  it("merges duplicate normalized stages", () => {
    const m = mapGroupByToStageCounts([
      { stage: null, _count: { id: 1 } },
      { stage: "", _count: { id: 2 } },
    ]);
    expect(m.get("Applied")).toBe(3);
  });
});

describe("orderPipelineSnapshotCounts", () => {
  it("orders Offer before Applied and buckets unknown as Other", () => {
    const ordered = orderPipelineSnapshotCounts(
      new Map([
        ["Applied", 5],
        ["Offer", 1],
        ["Interview", 2],
        ["Weird", 3],
      ])
    );
    expect(ordered.map((o) => o.stage)).toEqual(["Offer", "Interview", "Applied", "Other"]);
    expect(ordered.find((o) => o.stage === "Other")?.count).toBe(3);
  });

  it("omits zero stages", () => {
    const ordered = orderPipelineSnapshotCounts(new Map([["Applied", 2]]));
    expect(ordered).toEqual([{ stage: "Applied", count: 2 }]);
  });
});
