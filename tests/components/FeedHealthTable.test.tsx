import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedHealthTable } from "@/components/feeds/FeedHealthTable";

describe("FeedHealthTable", () => {
  it("renders a row per feed with counts", () => {
    render(
      <FeedHealthTable
        rows={[
          {
            source: "Adzuna",
            lastIngestAt: "2026-03-17T12:00:00.000Z",
            opportunities24h: 10,
            disqualified24h: 2,
            stale: false,
          },
          {
            source: "Reed",
            lastIngestAt: null,
            opportunities24h: 0,
            disqualified24h: 0,
            stale: true,
          },
        ]}
      />
    );

    expect(screen.getByText("Adzuna")).toBeInTheDocument();
    expect(screen.getByText("Reed")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("Check pipeline")).toBeInTheDocument();
  });

  it("shows column headers", () => {
    render(
      <FeedHealthTable
        rows={[
          {
            source: "Adzuna",
            lastIngestAt: null,
            opportunities24h: 0,
            disqualified24h: 0,
            stale: true,
          },
        ]}
      />
    );

    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Opps (24h)")).toBeInTheDocument();
    expect(screen.getByText("Disqualified (24h)")).toBeInTheDocument();
    expect(screen.getByText("Last ingest")).toBeInTheDocument();
  });

  it("shows empty state when no feeds", () => {
    render(<FeedHealthTable rows={[]} />);
    expect(screen.getByText(/no feeds configured yet/i)).toBeInTheDocument();
  });
});
