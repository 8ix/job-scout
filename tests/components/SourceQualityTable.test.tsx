import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SourceQualityTable } from "@/components/dashboard/SourceQualityTable";

describe("SourceQualityTable", () => {
  it("renders empty state", () => {
    render(<SourceQualityTable rows={[]} windowDays={30} />);
    expect(screen.getByText(/no ingest activity/i)).toBeInTheDocument();
  });

  it("renders rows", () => {
    render(
      <SourceQualityTable
        windowDays={30}
        rows={[
          {
            source: "Adzuna",
            opportunitiesIngested: 10,
            avgScore: 7.2,
            appliedInWindow: 2,
            applyRate: 0.2,
            disqualifiedOnly: 1,
          },
        ]}
      />
    );
    expect(screen.getByText("Adzuna")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20.0%")).toBeInTheDocument();
  });
});
