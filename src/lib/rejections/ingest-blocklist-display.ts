import type { IngestBlockScopeName } from "@/lib/ingest-blocklist/match";

/** Short label for Disqualified UI when a row is an ingest-blocklist hit. */
export function ingestBlocklistScopeLabel(scope: string | null | undefined): string {
  switch (scope as IngestBlockScopeName | undefined) {
    case "company":
      return "Company field only";
    case "title":
      return "Job title only";
    case "any":
      return "Any field (company, title, or description)";
    default:
      return scope ?? "—";
  }
}
