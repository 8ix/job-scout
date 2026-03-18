import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterBar } from "@/components/opportunities/FilterBar";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

const sources = ["Adzuna", "Reed", "JSearch"];

describe("FilterBar", () => {
  it("renders all filter dropdowns and score input", () => {
    render(<FilterBar sources={sources} />);

    expect(screen.getByLabelText("Filter by source")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by working model")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by listing type")).toBeInTheDocument();
    expect(screen.getByLabelText("Minimum score")).toBeInTheDocument();
  });

  it("renders correct source options from props", () => {
    render(<FilterBar sources={sources} />);
    const sourceSelect = screen.getByLabelText("Filter by source");
    const options = sourceSelect.querySelectorAll("option");
    expect(options).toHaveLength(4);
    expect(options[0].textContent).toBe("All Sources");
    expect(options[1].textContent).toBe("Adzuna");
  });

  it("renders correct status options", () => {
    render(<FilterBar sources={sources} />);
    const statusSelect = screen.getByLabelText("Filter by status");
    const options = statusSelect.querySelectorAll("option");
    expect(options).toHaveLength(6);
    expect(options[0].textContent).toBe("All Statuses");
  });

  it("renders correct working model options", () => {
    render(<FilterBar sources={sources} />);
    const select = screen.getByLabelText("Filter by working model");
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(5);
    expect(options[0].textContent).toBe("All Models");
  });

  it("renders correct listing type options", () => {
    render(<FilterBar sources={sources} />);
    const select = screen.getByLabelText("Filter by listing type");
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(3);
    expect(options[0].textContent).toBe("All Types");
  });
});
