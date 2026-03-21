import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedStaleAlert } from "@/components/dashboard/FeedStaleAlert";

describe("FeedStaleAlert", () => {
  it("renders nothing when no stale feeds", () => {
    const { container } = render(<FeedStaleAlert staleSources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders warning for one stale feed", () => {
    render(<FeedStaleAlert staleSources={["Adzuna"]} />);
    expect(screen.getByTestId("feed-stale-alert")).toBeInTheDocument();
    expect(screen.getByText(/Adzuna/)).toBeInTheDocument();
    expect(screen.getByText(/View feeds/i)).toBeInTheDocument();
  });

  it("renders list for multiple stale feeds", () => {
    render(<FeedStaleAlert staleSources={["A", "B"]} />);
    expect(screen.getByText(/A and B/)).toBeInTheDocument();
  });
});
