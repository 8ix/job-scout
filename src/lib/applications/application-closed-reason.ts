/** Stored on Opportunity.applicationClosedReason when leaving active apply flow. */

export const APPLICATION_CLOSED_REASON_EMPLOYER_REJECTED = "employer_rejected";
export const APPLICATION_CLOSED_REASON_USER_ARCHIVED = "user_archived";
export const APPLICATION_CLOSED_REASON_STALE_AUTO = "stale_auto";

export const REJECTION_REDFLAGS_EMPLOYER = "Organization rejected our application";
export const REJECTION_REDFLAGS_USER_ARCHIVED = "Archived by user";
/** Distinct prefix so stats / filters can recognize auto-stale rows even if reason is null on legacy data. */
export const REJECTION_REDFLAGS_STALE_AUTO =
  "AUTO_STALE: Archived automatically — no response within idle threshold (no upcoming calls).";

/** Stage log values that count as "had a conversation past apply" for retrospective stats. */
export const STAGES_COUNTING_AS_INTERVIEW_EXPOSURE = new Set([
  "Screening",
  "Interview",
  "Final Round",
  "Offer",
]);

export function closedReasonLabel(reason: string | null | undefined): string {
  switch (reason) {
    case APPLICATION_CLOSED_REASON_EMPLOYER_REJECTED:
      return "Employer rejected";
    case APPLICATION_CLOSED_REASON_USER_ARCHIVED:
      return "Archived (manual)";
    case APPLICATION_CLOSED_REASON_STALE_AUTO:
      return "Stale (auto-archived)";
    default:
      return "Unknown / legacy";
  }
}

export function hadInterviewExposureInStageLogs(
  logs: readonly { stage: string }[]
): boolean {
  return logs.some((l) => STAGES_COUNTING_AS_INTERVIEW_EXPOSURE.has(l.stage));
}
