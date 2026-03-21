import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OutcomeFunnel } from "@/components/dashboard/OutcomeFunnel";

const snap = (ingested: number, applied: number, dq: number, days: number) => ({
  windowDays: days,
  ingested,
  applied,
  disqualifiedListings: dq,
});

describe("OutcomeFunnel", () => {
  it("renders both windows", () => {
    render(
      <OutcomeFunnel seven={snap(5, 1, 2, 7)} thirty={snap(20, 4, 8, 30)} />
    );
    expect(screen.getByText(/last 7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});
