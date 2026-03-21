/** Rolling window for per-source quality metrics on the dashboard. */
export const SOURCE_QUALITY_WINDOW_DAYS = 30;

/** Outcome funnel windows shown side-by-side on the dashboard. */
export const OUTCOME_FUNNEL_WINDOWS_DAYS = [7, 30] as const;

/** Max rows in source quality table before summarizing (v1: no "Other" bucket, just cap). */
export const SOURCE_QUALITY_MAX_SOURCES = 12;
