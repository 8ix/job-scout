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

  it("renders bars with title attributes for each day", () => {
    const activity = [
      { date: "2026-03-15", count: 5 },
      { date: "2026-03-16", count: 8 },
    ];
    render(<RecentActivity activity={activity} />);

    expect(screen.getByTitle("2026-03-15: 5 jobs")).toBeInTheDocument();
    expect(screen.getByTitle("2026-03-16: 8 jobs")).toBeInTheDocument();
  });
});
