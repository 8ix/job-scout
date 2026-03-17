import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardError from "@/app/(dashboard)/error";

describe("DashboardError", () => {
  it("renders error message and try again button", () => {
    const error = new Error("Database connection failed");
    render(<DashboardError error={error} reset={vi.fn()} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when try again button is clicked", async () => {
    const reset = vi.fn();
    render(<DashboardError error={new Error("fail")} reset={reset} />);

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
