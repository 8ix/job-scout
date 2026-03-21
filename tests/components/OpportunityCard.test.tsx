import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { buildOpportunity } from "../helpers/factories";

describe("OpportunityCard", () => {
  const defaultOpp = buildOpportunity({
    title: "Senior TS Dev",
    company: "Acme Corp",
    location: "London",
    score: 9,
    verdict: "Strong fit",
    matchReasons: "Great TypeScript skills needed",
    redFlags: "Long commute possible",
    url: "https://example.com/job/1",
    source: "Adzuna",
    workingModel: "Remote",
    status: "new",
  });

  it("renders all key fields", () => {
    render(<OpportunityCard opportunity={defaultOpp} onStatusChange={vi.fn()} />);

    expect(screen.getByText("Senior TS Dev")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("Strong fit")).toBeInTheDocument();
    expect(screen.getByText("Great TypeScript skills needed")).toBeInTheDocument();
    expect(screen.getByText("Long commute possible")).toBeInTheDocument();
  });

  it("renders an external link to the job URL", () => {
    render(<OpportunityCard opportunity={defaultOpp} onStatusChange={vi.fn()} />);
    const link = screen.getByRole("link", { name: /view listing/i });
    expect(link).toHaveAttribute("href", "https://example.com/job/1");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("calls onStatusChange with 'applied' when applied button is clicked", async () => {
    const onStatusChange = vi.fn();
    render(<OpportunityCard opportunity={defaultOpp} onStatusChange={onStatusChange} />);

    const button = screen.getByRole("button", { name: /applied/i });
    await userEvent.click(button);

    expect(onStatusChange).toHaveBeenCalledWith(defaultOpp.id, "applied");
  });

  it("calls onStatusChange with 'rejected' when disqualify button is clicked", async () => {
    const onStatusChange = vi.fn();
    render(<OpportunityCard opportunity={defaultOpp} onStatusChange={onStatusChange} />);

    const button = screen.getByRole("button", { name: /disqualify/i });
    await userEvent.click(button);

    expect(onStatusChange).toHaveBeenCalledWith(defaultOpp.id, "rejected");
  });

  it("hides action buttons for non-new opportunities", () => {
    const appliedOpp = { ...defaultOpp, status: "applied" };
    render(<OpportunityCard opportunity={appliedOpp} onStatusChange={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /applied/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /disqualify/i })).not.toBeInTheDocument();
  });
});
