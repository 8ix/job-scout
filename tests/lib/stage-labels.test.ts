import { describe, it, expect } from "vitest";
import {
  applicationStageLabel,
  opportunityStatusOptionLabel,
} from "@/lib/ui/stage-labels";

describe("applicationStageLabel", () => {
  it("maps Rejected to Disqualified", () => {
    expect(applicationStageLabel("Rejected")).toBe("Disqualified");
  });

  it("passes through other stages", () => {
    expect(applicationStageLabel("Offer")).toBe("Offer");
    expect(applicationStageLabel("Applied")).toBe("Applied");
  });
});

describe("opportunityStatusOptionLabel", () => {
  it("maps rejected to Disqualified", () => {
    expect(opportunityStatusOptionLabel("rejected")).toBe("Disqualified");
  });

  it("includes All Statuses for All", () => {
    expect(opportunityStatusOptionLabel("All")).toBe("All Statuses");
  });
});
