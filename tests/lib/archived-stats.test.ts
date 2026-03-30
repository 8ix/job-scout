import { describe, it, expect } from "vitest";
import { summarizeArchivedApplications } from "@/lib/applications/archived-stats";
import {
  APPLICATION_CLOSED_REASON_EMPLOYER_REJECTED,
  APPLICATION_CLOSED_REASON_STALE_AUTO,
  APPLICATION_CLOSED_REASON_USER_ARCHIVED,
} from "@/lib/applications/application-closed-reason";

describe("summarizeArchivedApplications", () => {
  it("counts by reason and interview exposure", () => {
    const summary = summarizeArchivedApplications([
      {
        applicationClosedReason: APPLICATION_CLOSED_REASON_STALE_AUTO,
        stageLogs: [{ stage: "Applied" }],
      },
      {
        applicationClosedReason: APPLICATION_CLOSED_REASON_EMPLOYER_REJECTED,
        stageLogs: [{ stage: "Applied" }, { stage: "Interview" }],
      },
      {
        applicationClosedReason: APPLICATION_CLOSED_REASON_USER_ARCHIVED,
        stageLogs: [{ stage: "Screening" }],
      },
      {
        applicationClosedReason: null,
        stageLogs: [],
      },
    ]);

    expect(summary.total).toBe(4);
    expect(summary.byReason.staleAuto).toBe(1);
    expect(summary.byReason.employerRejected).toBe(1);
    expect(summary.byReason.userArchived).toBe(1);
    expect(summary.byReason.unknown).toBe(1);
    expect(summary.closedWithInterviewExposure).toBe(2);
  });
});
