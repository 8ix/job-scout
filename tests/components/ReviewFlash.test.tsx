import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewFlash } from "@/components/dashboard/ReviewFlash";

describe("ReviewFlash", () => {
  it("renders nothing when count is 0", () => {
    const { container } = render(<ReviewFlash count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when count is 1", () => {
    const { container } = render(<ReviewFlash count={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders flash message when count is greater than 1", () => {
    render(<ReviewFlash count={5} />);

    expect(screen.getByTestId("review-flash")).toBeInTheDocument();
    expect(screen.getByText(/There are 5 opportunities ready to be reviewed/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Review now/i });
    expect(link).toHaveAttribute("href", "/opportunities?status=new");
  });
});
