import { describe, it, expect } from "vitest";
import {
  buildSystemPrompt,
  formatSearchCriteriaSections,
} from "@/lib/search-criteria/build-system-prompt";
import {
  PROMPT_CORE_RULES,
  PROMPT_JSON_ONLY,
} from "@/lib/search-criteria/prompt-static";
import {
  emptySearchCriteria,
  parseSearchCriteriaJson,
  searchCriteriaSchema,
} from "@/lib/search-criteria/schema";

describe("searchCriteriaSchema", () => {
  it("accepts full criteria", () => {
    const data = emptySearchCriteria();
    data.whereWork.positive.push("Remote first");
    expect(searchCriteriaSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing criterion sections", () => {
    expect(
      searchCriteriaSchema.safeParse({
        introContext: "",
        additionalInstructions: "",
        whereWork: { positive: [], negative: [] },
      }).success
    ).toBe(false);
  });

  it("adds defaults for legacy rows without intro fields", () => {
    const legacy = {
      whereWork: { positive: [], negative: [] },
      compensation: { positive: [], negative: [] },
      companyCulture: { positive: [], negative: [] },
      role: { positive: [], negative: [] },
      skillsMatch: { positive: [], negative: [] },
    };
    const r = searchCriteriaSchema.safeParse(legacy);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.introContext).toBe("");
      expect(r.data.additionalInstructions).toBe("");
    }
  });
});

describe("parseSearchCriteriaJson", () => {
  it("returns empty criteria for invalid JSON", () => {
    expect(parseSearchCriteriaJson(null)).toEqual(emptySearchCriteria());
    expect(parseSearchCriteriaJson({ foo: 1 })).toEqual(emptySearchCriteria());
  });

  it("parses valid stored criteria", () => {
    const c = emptySearchCriteria();
    c.skillsMatch.positive.push("PHP");
    expect(parseSearchCriteriaJson(JSON.parse(JSON.stringify(c))).skillsMatch.positive).toEqual(["PHP"]);
  });
});

describe("formatSearchCriteriaSections", () => {
  it("shows placeholder when lists are empty", () => {
    const s = formatSearchCriteriaSections(emptySearchCriteria());
    expect(s).toContain("(none specified)");
    expect(s).toContain("Where you want to work");
    expect(s).toContain("Skills match");
  });

  it("includes bullets for non-empty entries", () => {
    const c = emptySearchCriteria();
    c.compensation.positive.push("Target £80–95k");
    c.compensation.negative.push("Below £70k");
    const s = formatSearchCriteriaSections(c);
    expect(s).toContain("- Target £80–95k");
    expect(s).toContain("- Below £70k");
  });
});

describe("buildSystemPrompt", () => {
  it("uses only neutral repo text when criteria and optional fields are empty", () => {
    const full = buildSystemPrompt(emptySearchCriteria());
    expect(full.startsWith(PROMPT_JSON_ONLY)).toBe(true);
    expect(full).toContain(PROMPT_CORE_RULES.slice(0, 40));
    expect(full).toContain("You are a job fit assistant");
    expect(full).toContain("Return ONLY this exact JSON structure");
    expect(full).not.toMatch(/Andrew|Yardley|Clifton|ENSEK|InkyStream/i);
  });

  it("injects user intro and additional instructions when set", () => {
    const c = emptySearchCriteria();
    c.introContext = "Helping a staff engineer in Berlin.";
    c.additionalInstructions = "Prefer concise red_flags.";
    c.whereWork.positive.push("Remote-first preferred");
    const full = buildSystemPrompt(c);
    expect(full).toContain("Helping a staff engineer in Berlin.");
    expect(full).toContain("Prefer concise red_flags.");
    const idxRemote = full.indexOf("Remote-first preferred");
    const idxScoring = full.indexOf("Scoring:");
    expect(idxRemote).toBeGreaterThan(-1);
    expect(idxScoring).toBeGreaterThan(idxRemote);
  });
});
