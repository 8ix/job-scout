import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import { buildOpportunity } from "../helpers/factories";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
) as unknown as typeof fetch;

describe("OpportunityList", () => {
  it("renders empty state when no opportunities", () => {
    render(<OpportunityList opportunities={[]} />);
    expect(screen.getByText("No opportunities match your filters.")).toBeInTheDocument();
  });

  it("renders opportunity cards for each item", () => {
    const opps = [
      buildOpportunity({ id: "1", title: "Dev A", company: "Corp A" }),
      buildOpportunity({ id: "2", title: "Dev B", company: "Corp B" }),
    ];
    render(<OpportunityList opportunities={opps} />);

    expect(screen.getByText("Dev A")).toBeInTheDocument();
    expect(screen.getByText("Dev B")).toBeInTheDocument();
    expect(screen.getByText("Corp A")).toBeInTheDocument();
    expect(screen.getByText("Corp B")).toBeInTheDocument();
  });

  it("renders the correct number of cards", () => {
    const opps = [
      buildOpportunity({ id: "1" }),
      buildOpportunity({ id: "2" }),
      buildOpportunity({ id: "3" }),
    ];
    render(<OpportunityList opportunities={opps} />);
    const links = screen.getAllByRole("link", { name: /view listing/i });
    expect(links).toHaveLength(3);
  });
});
