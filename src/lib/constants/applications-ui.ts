/**
 * Fallback when DB singleton is unavailable (e.g. tests). Production uses
 * ApplicationWorkflowSettings.staleIdleDays (default 40).
 */
export const DEFAULT_STALE_IDLE_DAYS = 40;

/** @deprecated Use DEFAULT_STALE_IDLE_DAYS or settings from DB. */
export const STALE_APPLICATION_IDLE_DAYS = DEFAULT_STALE_IDLE_DAYS;
