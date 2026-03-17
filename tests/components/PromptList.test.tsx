import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptList } from "@/components/prompts/PromptList";
import { buildSystemPrompt } from "../helpers/factories";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("PromptList", () => {
  const prompts = [
    buildSystemPrompt({ id: "p1", name: "Scoring v1", isActive: true, createdAt: new Date("2026-03-01") }),
    buildSystemPrompt({ id: "p2", name: "Scoring v2", isActive: false, createdAt: new Date("2026-03-10") }),
  ];

  it("renders all prompt versions", () => {
    render(<PromptList prompts={prompts} />);
    expect(screen.getByText("Scoring v1")).toBeInTheDocument();
    expect(screen.getByText("Scoring v2")).toBeInTheDocument();
  });

  it("shows active badge on the active prompt", () => {
    render(<PromptList prompts={prompts} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows activate button only on inactive prompts", () => {
    render(<PromptList prompts={prompts} />);
    const activateButtons = screen.getAllByRole("button", { name: /activate/i });
    expect(activateButtons).toHaveLength(1);
  });

  it("toggles prompt text visibility on click", async () => {
    render(<PromptList prompts={prompts} />);
    const toggleButtons = screen.getAllByRole("button", { name: /view prompt/i });
    await userEvent.click(toggleButtons[0]);
    expect(screen.getByText("You are a job scoring assistant...")).toBeInTheDocument();
  });
});
