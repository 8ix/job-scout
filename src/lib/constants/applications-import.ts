/** Default opportunity score for rows created from CSV (no score column in template). */
export const DEFAULT_CSV_IMPORT_SCORE = 6;

/** Maximum data rows accepted per upload (excluding header). */
export const MAX_CSV_IMPORT_ROWS = 1000;

/** Prefix for `jobId` when `external_id` is present (dedupe with @@unique source+jobId). */
export const CSV_IMPORT_JOB_ID_PREFIX = "csv-import:";
