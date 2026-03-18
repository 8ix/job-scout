import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreChart } from "@/components/dashboard/ScoreChart";

describe("ScoreChart", () => {
  it("renders empty state when no data", () => {
    render(<ScoreChart byScore={[]} />);
    expect(screen.getByText("No score data available yet.")).toBeInTheDocument();
  });

  it("renders heading", () => {
    render(<ScoreChart byScore={[]} />);
    expect(screen.getByText("Score Distribution")).toBeInTheDocument();
  });

  it("renders a bar for each score band", () => {
    const byScore = [
      { band: "Disqualified", count: 10 },
      { band: "6", count: 5 },
      { band: "7", count: 25 },
      { band: "8", count: 40 },
    ];
    render(<ScoreChart byScore={byScore} />);

    expect(screen.getByText("Disqualified")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });
});
