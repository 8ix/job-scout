import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@/components/ui/Pagination";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("page=2"),
}));

describe("Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when total fits in one page", () => {
    const { container } = render(<Pagination total={10} page={1} limit={20} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders showing text and navigation buttons", () => {
    render(<Pagination total={50} page={2} limit={20} />);

    expect(screen.getByText(/Showing 21–40 of 50/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("disables Previous on first page", () => {
    render(<Pagination total={50} page={1} limit={20} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("disables Next on last page", () => {
    render(<Pagination total={50} page={3} limit={20} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls router.push on Next click", async () => {
    render(<Pagination total={50} page={2} limit={20} />);
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(mockPush).toHaveBeenCalledWith("?page=3");
  });

  it("calls router.push on Previous click", async () => {
    render(<Pagination total={50} page={2} limit={20} />);
    await userEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(mockPush).toHaveBeenCalledWith("?page=1");
  });
});
