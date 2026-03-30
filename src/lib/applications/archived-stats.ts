import {
  APPLICATION_CLOSED_REASON_EMPLOYER_REJECTED,
  APPLICATION_CLOSED_REASON_STALE_AUTO,
  APPLICATION_CLOSED_REASON_USER_ARCHIVED,
  hadInterviewExposureInStageLogs,
} from "@/lib/applications/application-closed-reason";

export type ArchivedApplicationsSummary = {
  total: number;
  byReason: {
    employerRejected: number;
    userArchived: number;
    staleAuto: number;
    unknown: number;
  };
  /** Had Screening, Interview, Final Round, or Offer in stage logs before close. */
  closedWithInterviewExposure: number;
};

export function summarizeArchivedApplications<
  T extends {
    applicationClosedReason: string | null;
    stageLogs: { stage: string }[];
  },
>(rows: T[]): ArchivedApplicationsSummary {
  const byReason = {
    employerRejected: 0,
    userArchived: 0,
    staleAuto: 0,
    unknown: 0,
  };
  let closedWithInterviewExposure = 0;

  for (const row of rows) {
    switch (row.applicationClosedReason) {
      case APPLICATION_CLOSED_REASON_EMPLOYER_REJECTED:
        byReason.employerRejected += 1;
        break;
      case APPLICATION_CLOSED_REASON_USER_ARCHIVED:
        byReason.userArchived += 1;
        break;
      case APPLICATION_CLOSED_REASON_STALE_AUTO:
        byReason.staleAuto += 1;
        break;
      default:
        byReason.unknown += 1;
    }
    if (hadInterviewExposureInStageLogs(row.stageLogs)) {
      closedWithInterviewExposure += 1;
    }
  }

  return {
    total: rows.length,
    byReason,
    closedWithInterviewExposure,
  };
}
