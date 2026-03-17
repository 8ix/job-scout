import { describe, it, expect } from "vitest";
import { createOpportunitySchema, updateOpportunitySchema } from "@/lib/validators/opportunity";
import { createRejectionSchema } from "@/lib/validators/rejection";
import { createHeartbeatSchema } from "@/lib/validators/heartbeat";
import { createPromptSchema } from "@/lib/validators/prompt";

describe("createOpportunitySchema", () => {
  const valid = {
    jobId: "abc123",
    source: "Adzuna",
    title: "Dev",
    company: "Corp",
    score: 8,
    verdict: "Strong fit",
    url: "https://example.com/job",
  };

  it("accepts valid minimal input", () => {
    expect(createOpportunitySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing jobId", () => {
    const { jobId, ...rest } = valid;
    expect(createOpportunitySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid source", () => {
    expect(createOpportunitySchema.safeParse({ ...valid, source: "LinkedIn" }).success).toBe(false);
  });

  it("rejects score > 10", () => {
    expect(createOpportunitySchema.safeParse({ ...valid, score: 11 }).success).toBe(false);
  });

  it("rejects score < 0", () => {
    expect(createOpportunitySchema.safeParse({ ...valid, score: -1 }).success).toBe(false);
  });

  it("rejects invalid URL", () => {
    expect(createOpportunitySchema.safeParse({ ...valid, url: "not-a-url" }).success).toBe(false);
  });

  it("rejects invalid verdict", () => {
    expect(createOpportunitySchema.safeParse({ ...valid, verdict: "Maybe" }).success).toBe(false);
  });

  it("accepts optional fields as null", () => {
    const result = createOpportunitySchema.safeParse({
      ...valid,
      location: null,
      salaryMin: null,
      salaryMax: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateOpportunitySchema", () => {
  it("accepts valid statuses", () => {
    for (const status of ["new", "reviewed", "applied", "rejected", "archived"]) {
      expect(updateOpportunitySchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(updateOpportunitySchema.safeParse({ status: "deleted" }).success).toBe(false);
  });
});

describe("createRejectionSchema", () => {
  it("accepts valid input", () => {
    const result = createRejectionSchema.safeParse({
      jobId: "j1",
      source: "Reed",
      title: "Dev",
      url: "https://example.com",
      score: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createRejectionSchema.safeParse({
      jobId: "j1",
      source: "Reed",
      url: "https://example.com",
      score: 2,
    });
    expect(result.success).toBe(false);
  });
});

describe("createHeartbeatSchema", () => {
  it("accepts valid input", () => {
    const result = createHeartbeatSchema.safeParse({
      source: "Adzuna",
      jobsReceived: 50,
      jobsNew: 10,
      jobsScored: 10,
      jobsOpportunity: 3,
      ranAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative job counts", () => {
    const result = createHeartbeatSchema.safeParse({
      source: "Adzuna",
      jobsReceived: -1,
      jobsNew: 10,
      jobsScored: 10,
      jobsOpportunity: 3,
      ranAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime format", () => {
    const result = createHeartbeatSchema.safeParse({
      source: "Adzuna",
      jobsReceived: 50,
      jobsNew: 10,
      jobsScored: 10,
      jobsOpportunity: 3,
      ranAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("createPromptSchema", () => {
  it("accepts valid input", () => {
    const result = createPromptSchema.safeParse({
      name: "v1",
      systemPrompt: "Prompt text",
      userPromptTemplate: "Template",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createPromptSchema.safeParse({
      name: "",
      systemPrompt: "Prompt text",
      userPromptTemplate: "Template",
    });
    expect(result.success).toBe(false);
  });
});
