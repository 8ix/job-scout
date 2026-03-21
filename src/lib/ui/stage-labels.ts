/**
 * Maps stored stage / status values to user-facing copy.
 * Backend and APIs keep technical names (e.g. "Rejected", status "rejected").
 */
export function applicationStageLabel(stage: string): string {
  return stage === "Rejected" ? "Disqualified" : stage;
}

/** Filter dropdown: maps URL/query status value to visible label */
export function opportunityStatusOptionLabel(status: string): string {
  switch (status) {
    case "All":
      return "All Statuses";
    case "rejected":
      return "Disqualified";
    case "new":
      return "New";
    case "reviewed":
      return "Reviewed";
    case "applied":
      return "Applied";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}
