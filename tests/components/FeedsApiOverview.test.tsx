import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedsApiOverview } from "@/components/feeds/FeedsApiOverview";

describe("FeedsApiOverview", () => {
  it("renders setup and auth guidance", () => {
    render(<FeedsApiOverview />);
    expect(screen.getByTestId("feeds-api-overview")).toBeInTheDocument();
    expect(screen.getByText(/API setup for workflows/i)).toBeInTheDocument();
    expect(screen.getByText(/X-API-Key/i)).toBeInTheDocument();
  });
});
