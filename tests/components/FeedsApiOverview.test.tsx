import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedsApiOverview } from "@/components/feeds/FeedsApiOverview";

describe("FeedsApiOverview", () => {
  it("renders setup and auth guidance", () => {
    render(<FeedsApiOverview />);
    expect(screen.getByTestId("feeds-api-overview")).toBeInTheDocument();
    expect(screen.getByText(/API setup for workflows/i)).toBeInTheDocument();
    expect(screen.getAllByText(/X-API-Key/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/GET \/api\/ingest-blocklist/i)).toBeInTheDocument();
  });
});
