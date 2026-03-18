import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedManager } from "@/components/feeds/FeedManager";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

global.fetch = vi.fn();

describe("FeedManager", () => {
  const feeds = [
    { id: "f1", name: "Adzuna", createdAt: "2026-03-01T00:00:00.000Z" },
    { id: "f2", name: "Reed", createdAt: "2026-03-05T00:00:00.000Z" },
  ];

  it("renders all feeds", () => {
    render(<FeedManager feeds={feeds} />);
    expect(screen.getByText("Adzuna")).toBeInTheDocument();
    expect(screen.getByText("Reed")).toBeInTheDocument();
  });

  it("renders add feed form with input and button", () => {
    render(<FeedManager feeds={feeds} />);
    expect(screen.getByPlaceholderText("Feed name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add feed/i })).toBeInTheDocument();
  });

  it("renders delete button for each feed", () => {
    render(<FeedManager feeds={feeds} />);
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("renders API reference toggle for each feed", () => {
    render(<FeedManager feeds={feeds} />);
    const toggleButtons = screen.getAllByRole("button", { name: /api reference/i });
    expect(toggleButtons).toHaveLength(2);
  });

  it("shows API reference panel when toggled", async () => {
    render(<FeedManager feeds={feeds} />);
    const toggleButtons = screen.getAllByRole("button", { name: /api reference/i });
    await userEvent.click(toggleButtons[0]);
    expect(screen.getByText("/api/opportunities")).toBeInTheDocument();
    expect(screen.getByText("/api/rejections")).toBeInTheDocument();
    expect(screen.getByText("/api/heartbeats")).toBeInTheDocument();
    expect(screen.getByText("/api/seen-ids")).toBeInTheDocument();
    expect(screen.getByText("/api/prompts/active")).toBeInTheDocument();
  });

  it("shows empty state when no feeds exist", () => {
    render(<FeedManager feeds={[]} />);
    expect(screen.getByText(/no feeds configured/i)).toBeInTheDocument();
  });
});
