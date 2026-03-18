import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTimeAgo } from "@/lib/format";

describe("formatTimeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates within the last minute', () => {
    expect(formatTimeAgo(new Date("2026-03-17T11:59:30Z"))).toBe("just now");
  });

  it('returns "1 minute ago" for one minute ago', () => {
    expect(formatTimeAgo(new Date("2026-03-17T11:59:00Z"))).toBe("1 minute ago");
  });

  it('returns "X minutes ago" for multiple minutes', () => {
    expect(formatTimeAgo(new Date("2026-03-17T11:55:00Z"))).toBe("5 minutes ago");
  });

  it('returns "1 hour ago" for one hour ago', () => {
    expect(formatTimeAgo(new Date("2026-03-17T11:00:00Z"))).toBe("1 hour ago");
  });

  it('returns "X hours ago" for multiple hours', () => {
    expect(formatTimeAgo(new Date("2026-03-17T10:00:00Z"))).toBe("2 hours ago");
  });

  it('returns "1 day ago" for one day ago', () => {
    expect(formatTimeAgo(new Date("2026-03-16T12:00:00Z"))).toBe("1 day ago");
  });

  it('returns "X days ago" for multiple days', () => {
    expect(formatTimeAgo(new Date("2026-03-15T12:00:00Z"))).toBe("2 days ago");
  });

  it('returns "1 week ago" for one week ago', () => {
    expect(formatTimeAgo(new Date("2026-03-10T12:00:00Z"))).toBe("1 week ago");
  });

  it('returns "X weeks ago" for multiple weeks', () => {
    expect(formatTimeAgo(new Date("2026-03-03T12:00:00Z"))).toBe("2 weeks ago");
  });

  it('returns "1 year ago" for one year ago', () => {
    expect(formatTimeAgo(new Date("2025-03-17T12:00:00Z"))).toBe("1 year ago");
  });

  it('returns "X years ago" for multiple years', () => {
    expect(formatTimeAgo(new Date("2024-03-17T12:00:00Z"))).toBe("2 years ago");
  });
});
