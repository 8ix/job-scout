import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

describe("RecentActivity", () => {
  it("renders empty state when no activity", () => {
    render(<RecentActivity activity={[]} />);
    expect(screen.getByText("No recent activity.")).toBeInTheDocument();
  });

  it("renders the heading", () => {
    render(<RecentActivity activity={[]} />);
    expect(screen.getByText("Recent Activity (14 days)")).toBeInTheDocument();
  });

  it("renders three bars and total jobs for each day", () => {
    const activity = [
      {
        date: "2026-03-15",
        opportunities: 3,
        workflowRejected: 2,
        blocked: 1,
        jobsProcessed: 6,
      },
      {
        date: "2026-03-16",
        opportunities: 5,
        workflowRejected: 1,
        blocked: 0,
        jobsProcessed: 6,
      },
    ];
    render(<RecentActivity activity={activity} />);

    expect(screen.getByTitle("Opportunities: 3")).toBeInTheDocument();
    expect(screen.getByTitle("Disqualified (workflow): 2")).toBeInTheDocument();
    expect(screen.getByTitle("Blocked (ingest list): 1")).toBeInTheDocument();
    expect(screen.getByTitle("Opportunities: 5")).toBeInTheDocument();
    expect(screen.getByTitle("Disqualified (workflow): 1")).toBeInTheDocument();
    expect(screen.getAllByText("6 jobs")).toHaveLength(2);
  });
});
