import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailyFeedJobs } from "@/components/dashboard/DailyFeedJobs";

describe("DailyFeedJobs", () => {
  it("renders empty state when no feeds", () => {
    render(<DailyFeedJobs feeds={[]} />);
    expect(screen.getByText("No feeds configured yet.")).toBeInTheDocument();
  });

  it("renders feed data with opportunities and disqualified counts", () => {
    render(
      <DailyFeedJobs
        feeds={[
          { source: "Adzuna", opportunities: 10, rejected: 5, blocked: 0 },
          { source: "Reed", opportunities: 2, rejected: 15, blocked: 1 },
        ]}
      />
    );
    expect(screen.getByText("Daily Feed Jobs (24h)")).toBeInTheDocument();
    expect(screen.getByText("Adzuna")).toBeInTheDocument();
    expect(screen.getByText("Reed")).toBeInTheDocument();
    expect(screen.getByText("10 opps / 5 disqualified")).toBeInTheDocument();
    expect(screen.getByText(/2 opps \/ 15 disqualified \/ 1 blocked/)).toBeInTheDocument();
  });

  it("renders last received time when provided", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T12:00:00Z"));
    try {
      const twoDaysAgo = new Date("2026-03-15T12:00:00Z");
      render(
        <DailyFeedJobs
          feeds={[
            {
              source: "Reed",
              opportunities: 13,
              rejected: 59,
              blocked: 0,
              lastReceivedAt: twoDaysAgo.toISOString(),
            },
          ]}
        />
      );
      expect(screen.getByText(/last ingest 2 days ago/)).toBeInTheDocument();
      expect(screen.getByText("13 opps / 59 disqualified")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows stale warning when no ingest in 24h", () => {
    render(
      <DailyFeedJobs
        feeds={[
          {
            source: "QuietFeed",
            opportunities: 0,
            rejected: 0,
            blocked: 0,
            lastReceivedAt: null,
            stale: true,
          },
        ]}
      />
    );
    expect(screen.getByText("No ingest in 24h")).toBeInTheDocument();
    expect(screen.getByText("(no recorded ingest)")).toBeInTheDocument();
  });
});
