import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedHealthTable } from "@/components/feeds/FeedHealthTable";
import { buildFeedHeartbeat } from "../helpers/factories";

describe("FeedHealthTable", () => {
  it("renders a row for each heartbeat", () => {
    const heartbeats = [
      buildFeedHeartbeat({ source: "Adzuna", jobsReceived: 50, jobsNew: 10, jobsScored: 8, jobsOpportunity: 3 }),
      buildFeedHeartbeat({ source: "Reed", jobsReceived: 30, jobsNew: 5, jobsScored: 4, jobsOpportunity: 1 }),
    ];

    render(<FeedHealthTable heartbeats={heartbeats} />);

    expect(screen.getByText("Adzuna")).toBeInTheDocument();
    expect(screen.getByText("Reed")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("shows column headers", () => {
    render(<FeedHealthTable heartbeats={[buildFeedHeartbeat()]} />);

    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Received")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Scored")).toBeInTheDocument();
    expect(screen.getByText("Opportunities")).toBeInTheDocument();
    expect(screen.getByText("Ran At")).toBeInTheDocument();
  });

  it("shows empty state when no heartbeats", () => {
    render(<FeedHealthTable heartbeats={[]} />);
    expect(screen.getByText(/no heartbeat data/i)).toBeInTheDocument();
  });
});
