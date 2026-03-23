/** Mirrors Prisma `IngestBlockScope` for use without coupling tests to generated enums. */
export type IngestBlockScopeName = "company" | "title" | "any";

export type IngestBlockRuleForMatch = {
  id: string;
  pattern: string;
  scope: IngestBlockScopeName;
};

export type OpportunityPayloadForBlock = {
  company: string;
  title: string;
  description?: string | null;
};

function normalizeForMatch(s: string): string {
  return s.trim().toLowerCase();
}

function containsIgnoreCase(haystack: string, needle: string): boolean {
  const n = normalizeForMatch(needle);
  if (n.length === 0) return false;
  return normalizeForMatch(haystack).includes(n);
}

/**
 * Returns the first enabled rule that matches the opportunity payload (case-insensitive substring).
 */
export function findMatchingIngestBlockRule(
  payload: OpportunityPayloadForBlock,
  rules: IngestBlockRuleForMatch[]
): IngestBlockRuleForMatch | null {
  for (const rule of rules) {
    const p = rule.pattern.trim();
    if (p.length === 0) continue;

    switch (rule.scope) {
      case "company":
        if (containsIgnoreCase(payload.company, p)) return rule;
        break;
      case "title":
        if (containsIgnoreCase(payload.title, p)) return rule;
        break;
      case "any": {
        const desc = payload.description ?? "";
        if (
          containsIgnoreCase(payload.company, p) ||
          containsIgnoreCase(payload.title, p) ||
          containsIgnoreCase(desc, p)
        ) {
          return rule;
        }
        break;
      }
      default:
        break;
    }
  }
  return null;
}
