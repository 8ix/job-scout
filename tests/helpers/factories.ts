import { randomUUID } from "crypto";

export function buildOpportunity(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    jobId: `job-${Math.random().toString(36).slice(2, 8)}`,
    source: "Adzuna",
    title: "Senior TypeScript Developer",
    company: "Acme Corp",
    location: "London, UK",
    workingModel: "Remote",
    listingType: "Direct",
    salaryMin: 60000,
    salaryMax: 80000,
    score: 8,
    verdict: "Strong fit",
    matchReasons: "Excellent TypeScript experience required",
    redFlags: null,
    url: "https://example.com/job/123",
    description: "A great opportunity for a TypeScript developer...",
    status: "new",
    appliedAt: null,
    createdAt: new Date(),
    postedAt: new Date(),
    ...overrides,
  };
}

export function buildRejection(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    jobId: `job-${Math.random().toString(36).slice(2, 8)}`,
    source: "Reed",
    title: "Junior PHP Developer",
    company: "Some Corp",
    url: "https://example.com/job/456",
    score: 2,
    redFlags: "Requires PHP, no TypeScript mentioned",
    createdAt: new Date(),
    ...overrides,
  };
}

export function buildSystemPrompt(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    name: "Main scoring prompt v1",
    systemPrompt: "You are a job scoring assistant...",
    userPromptTemplate: "Score this job: {{title}} at {{company}}",
    isActive: false,
    createdAt: new Date(),
    notes: null,
    ...overrides,
  };
}

export function buildFeedHeartbeat(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    source: "Adzuna",
    jobsReceived: 50,
    jobsNew: 10,
    jobsScored: 10,
    jobsOpportunity: 3,
    ranAt: new Date(),
    ...overrides,
  };
}

export function buildOpportunityInput(overrides: Record<string, unknown> = {}) {
  return {
    jobId: `job-${Math.random().toString(36).slice(2, 8)}`,
    source: "Adzuna",
    title: "Senior TypeScript Developer",
    company: "Acme Corp",
    location: "London, UK",
    workingModel: "Remote",
    listingType: "Direct",
    salaryMin: 60000,
    salaryMax: 80000,
    score: 8,
    verdict: "Strong fit",
    matchReasons: "Excellent TypeScript experience required",
    redFlags: null,
    url: "https://example.com/job/123",
    description: "A great opportunity...",
    postedAt: new Date().toISOString(),
    ...overrides,
  };
}
