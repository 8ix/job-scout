import type { CriterionPair, SearchCriteria } from "./schema";
import {
  PROMPT_CORE_RULES,
  PROMPT_CRITERIA_PREAMBLE,
  PROMPT_JSON_ONLY,
  PROMPT_ROLE_FRAMING,
} from "./prompt-static";

function trimBullet(s: string): string {
  return s.trim();
}

function formatOptionalUserBlock(title: string, body: string): string {
  const t = body.trim();
  if (!t) return "";
  return `${title}\n${t}`;
}

function formatPairBlock(sectionTitle: string, pair: CriterionPair): string {
  const pos = pair.positive.map(trimBullet).filter(Boolean);
  const neg = pair.negative.map(trimBullet).filter(Boolean);
  const lines: string[] = [`${sectionTitle}`, "Positive signals:"];
  if (pos.length === 0) lines.push("(none specified)");
  else pos.forEach((p) => lines.push(`- ${p}`));
  lines.push("Negative signals:");
  if (neg.length === 0) lines.push("(none specified)");
  else neg.forEach((n) => lines.push(`- ${n}`));
  return lines.join("\n");
}

export function formatSearchCriteriaSections(criteria: SearchCriteria): string {
  const blocks = [
    formatPairBlock("Where you want to work", criteria.whereWork),
    formatPairBlock("Compensation expectations", criteria.compensation),
    formatPairBlock("Company, culture, and environment", criteria.companyCulture),
    formatPairBlock("Role you are looking for", criteria.role),
    formatPairBlock("Skills match", criteria.skillsMatch),
  ];
  return blocks.join("\n\n");
}

/** Deterministic system prompt: neutral template plus user-owned criteria and text. */
export function buildSystemPrompt(criteria: SearchCriteria): string {
  const parts: string[] = [PROMPT_JSON_ONLY, PROMPT_ROLE_FRAMING];

  const intro = formatOptionalUserBlock(
    "Context (who you are helping and any fixed background — optional):",
    criteria.introContext
  );
  if (intro) parts.push(intro);

  parts.push(PROMPT_CRITERIA_PREAMBLE);
  parts.push(formatSearchCriteriaSections(criteria));
  parts.push(PROMPT_CORE_RULES);

  const extra = formatOptionalUserBlock(
    "Additional instructions (tone, extra rules, or output expectations — optional):",
    criteria.additionalInstructions
  );
  if (extra) parts.push(extra);

  return parts.join("\n\n");
}
