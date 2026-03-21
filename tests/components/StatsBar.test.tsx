import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsBar } from "@/components/dashboard/StatsBar";

describe("StatsBar", () => {
  const stats = {
    totalOpportunities: 150,
    totalRejections: 75,
    applied: 12,
    conversionRate: 0.08,
  };

  it("renders all stat cards", () => {
    render(<StatsBar stats={stats} />);

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8.0%")).toBeInTheDocument();
  });

  it("renders labels for each stat", () => {
    render(<StatsBar stats={stats} />);

    expect(screen.getByText("Opportunities")).toBeInTheDocument();
    expect(screen.getByText("Disqualified")).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("% Applied")).toBeInTheDocument();
  });

  it("handles zero state", () => {
    render(
      <StatsBar
        stats={{
          totalOpportunities: 0,
          totalRejections: 0,
          applied: 0,
          conversionRate: 0,
        }}
      />
    );

    expect(screen.getAllByText("0")).toHaveLength(3);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });
});
