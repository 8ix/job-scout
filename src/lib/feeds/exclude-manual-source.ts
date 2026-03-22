import { MANUAL_SOURCE } from "@/lib/constants/manual-source";

/** Exclude the reserved `manual` feed from dashboard “daily feed” style summaries. */
export function excludeManualSource<T extends { source: string }>(rows: T[]): T[] {
  return rows.filter((r) => r.source !== MANUAL_SOURCE);
}
