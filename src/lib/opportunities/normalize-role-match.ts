/**
 * Collapse whitespace and lowercase so minor formatting differences
 * (extra spaces, casing) don't prevent duplicate detection.
 */
function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Canonical key for comparing whether two listings refer to the same role.
 * Used during ingest to detect reposted jobs you've already applied to.
 */
export function normalizeRoleMatchKey(title: string, company: string): string {
  return `${normalize(title)}::${normalize(company)}`;
}
