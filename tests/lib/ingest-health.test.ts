import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  FEED_STALE_AFTER_MS,
  isFeedIngestStale,
  feedIngestUiStatus,
} from "@/lib/feeds/ingest-health";

describe("ingest-health", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-18T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("FEED_STALE_AFTER_MS is 24 hours", () => {
    expect(FEED_STALE_AFTER_MS).toBe(24 * 60 * 60 * 1000);
  });

  it("isFeedIngestStale is true when never ingested", () => {
    expect(isFeedIngestStale(null)).toBe(true);
  });

  it("isFeedIngestStale is false when last ingest within 24h", () => {
    const recent = new Date("2026-03-18T06:00:00.000Z");
    expect(isFeedIngestStale(recent)).toBe(false);
  });

  it("isFeedIngestStale is true when last ingest older than 24h", () => {
    const old = new Date("2026-03-16T12:00:00.000Z");
    expect(isFeedIngestStale(old)).toBe(true);
  });

  it("feedIngestUiStatus maps to stale vs ok", () => {
    expect(feedIngestUiStatus(null)).toBe("stale");
    expect(feedIngestUiStatus(new Date("2026-03-18T11:00:00.000Z"))).toBe("ok");
    expect(feedIngestUiStatus(new Date("2026-03-16T00:00:00.000Z"))).toBe("stale");
  });
});
