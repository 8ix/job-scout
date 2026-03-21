import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PipelineSnapshot } from "@/components/dashboard/PipelineSnapshot";

describe("PipelineSnapshot", () => {
  it("shows empty state", () => {
    render(<PipelineSnapshot totalActive={0} stages={[]} />);
    expect(screen.getByText(/no active applications/i)).toBeInTheDocument();
  });

  it("shows total and stages", () => {
    render(
      <PipelineSnapshot
        totalActive={3}
        stages={[
          { stage: "Interview", count: 2 },
          { stage: "Applied", count: 1 },
        ]}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view applications/i })).toHaveAttribute(
      "href",
      "/applications"
    );
  });
});
