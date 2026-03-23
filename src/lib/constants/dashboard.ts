/** Rolling window for per-source quality metrics on the dashboard. */
export const SOURCE_QUALITY_WINDOW_DAYS = 30;

/** Outcome funnel windows shown side-by-side on the dashboard. */
export const OUTCOME_FUNNEL_WINDOWS_DAYS = [7, 30] as const;

/** Max rows in source quality table before summarizing (v1: no "Other" bucket, just cap). */
export const SOURCE_QUALITY_MAX_SOURCES = 12;

/** “Stuck new” = in review queue and at least this many days since ingest. */
export const STUCK_NEW_DAYS = 7;

/** Rolling cohort: opportunities ingested in this window → applied (ever) rate by source. */
export const CONVERSION_COHORT_WINDOW_DAYS = 30;

/** Applications with appliedAt in this window considered for median days to first screening/interview. */
export const FIRST_CALL_MEDIAN_WINDOW_DAYS = 90;

/** Max rows in conversion-by-source table. */
export const CONVERSION_BY_SOURCE_MAX_ROWS = 12;

/** Window for “top blocked patterns” card on the dashboard. */
export const INGEST_BLOCKLIST_PATTERN_WINDOW_DAYS = 30;
