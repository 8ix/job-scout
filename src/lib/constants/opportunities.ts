/**
 * Default minimum score for the Opportunities list (desktop + mobile quick review).
 * Nav badges and dashboard "new to review" use the same rule so counts match the default view.
 */
export const DEFAULT_OPPORTUNITY_SCORE_MIN = 6;

/**
 * Rolling window (days) for recent-application dedup on ingest.
 * If a feed job matches the title+company of an active application applied
 * within this many days, it is rejected instead of becoming a new opportunity.
 */
export const RECENT_APPLICATION_ROLE_MATCH_DAYS = 30;
