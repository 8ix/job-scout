import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RejectionCard } from "@/components/rejections/RejectionCard";
import { buildRejection } from "../helpers/factories";

describe("RejectionCard", () => {
  const rejection = buildRejection({
    title: "Junior PHP Dev",
    company: "PHP Corp",
    source: "Reed",
    score: 2,
    redFlags: "PHP only, no modern stack",
    url: "https://example.com/job/999",
  });

  it("renders title, company, source, score, and red flags", () => {
    render(<RejectionCard rejection={rejection} />);

    expect(screen.getByText("Junior PHP Dev")).toBeInTheDocument();
    expect(screen.getByText("PHP Corp")).toBeInTheDocument();
    expect(screen.getByText("Reed")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("PHP only, no modern stack")).toBeInTheDocument();
  });

  it("renders external URL link", () => {
    render(<RejectionCard rejection={rejection} />);
    const link = screen.getByRole("link", { name: /view listing/i });
    expect(link).toHaveAttribute("href", "https://example.com/job/999");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
