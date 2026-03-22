import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewQueueBreakdown } from "@/components/dashboard/ReviewQueueBreakdown";

describe("ReviewQueueBreakdown", () => {
  it("shows empty when total zero", () => {
    render(<ReviewQueueBreakdown byVerdict={[]} byScore={[]} />);
    expect(screen.getByText(/nothing in queue/i)).toBeInTheDocument();
  });

  it("renders verdict and score sections", () => {
    render(
      <ReviewQueueBreakdown
        byVerdict={[{ verdict: "Strong fit", count: 2 }]}
        byScore={[{ score: 8, count: 2 }]}
      />
    );
    expect(screen.getByText("Strong fit")).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });
});
