import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeartbeatPanel, getHeartbeatStatus } from "@/components/dashboard/HeartbeatPanel";

describe("getHeartbeatStatus", () => {
  it("returns green for heartbeat within 25 hours", () => {
    const recent = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
    expect(getHeartbeatStatus(recent)).toBe("green");
  });

  it("returns amber for heartbeat within 48 hours", () => {
    const older = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    expect(getHeartbeatStatus(older)).toBe("amber");
  });

  it("returns red for heartbeat beyond 48 hours", () => {
    const stale = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();
    expect(getHeartbeatStatus(stale)).toBe("red");
  });

  it("returns red for null (never ran)", () => {
    expect(getHeartbeatStatus(null)).toBe("red");
  });
});

describe("HeartbeatPanel", () => {
  it("renders a row for each source", () => {
    const heartbeats = [
      { source: "Adzuna", ranAt: new Date().toISOString(), jobsReceived: 50, jobsNew: 10, jobsScored: 10, jobsOpportunity: 3 },
      { source: "Reed", ranAt: new Date().toISOString(), jobsReceived: 30, jobsNew: 5, jobsScored: 5, jobsOpportunity: 1 },
    ];

    render(<HeartbeatPanel heartbeats={heartbeats} />);

    expect(screen.getByText("Adzuna")).toBeInTheDocument();
    expect(screen.getByText("Reed")).toBeInTheDocument();
  });

  it("shows 'No data' when heartbeats list is empty", () => {
    render(<HeartbeatPanel heartbeats={[]} />);
    expect(screen.getByText(/no feed data/i)).toBeInTheDocument();
  });
});
