import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextActionsStrip } from "@/components/dashboard/NextActionsStrip";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";
import { STUCK_NEW_DAYS } from "@/lib/constants/dashboard";

describe("NextActionsStrip", () => {
  it("renders counts and review / stuck links", () => {
    render(
      <NextActionsStrip
        toReview={5}
        stuckNew={2}
        staleFeedCount={1}
        upcomingInterviewCount={3}
        activeApplications={4}
      />
    );
    expect(screen.getByTestId("next-actions-strip")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    const review = screen.getByRole("link", { name: /to review/i });
    expect(review).toHaveAttribute(
      "href",
      `/opportunities?status=new&score_min=${DEFAULT_OPPORTUNITY_SCORE_MIN}`
    );
    const stuck = screen.getByRole("link", { name: /stuck/i });
    expect(stuck.getAttribute("href")).toContain(`min_age_days=${STUCK_NEW_DAYS}`);
  });
});
