import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileOpportunityList } from "@/components/mobile/MobileOpportunityList";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("MobileOpportunityList", () => {
  it("shows empty message when there are no opportunities", () => {
    render(<MobileOpportunityList opportunities={[]} />);
    expect(screen.getByText(/No new opportunities to review right now/)).toBeInTheDocument();
  });

  it("renders list when opportunities exist", () => {
    render(
      <MobileOpportunityList
        opportunities={[
          {
            id: "1",
            title: "Engineer",
            company: "Acme",
            location: "London",
            score: 8,
            verdict: "Strong fit",
            url: "https://example.com/j",
            source: "manual",
            status: "new",
          },
        ]}
      />
    );
    expect(screen.getByTestId("mobile-opportunity-list")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /applied/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });
});
