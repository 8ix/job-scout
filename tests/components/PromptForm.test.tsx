import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptForm } from "@/components/prompts/PromptForm";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
) as unknown as typeof fetch;

describe("PromptForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initially shows only the 'New prompt version' button", () => {
    render(<PromptForm />);
    expect(screen.getByRole("button", { name: /new prompt version/i })).toBeInTheDocument();
    expect(screen.queryByText("Create New Prompt Version")).not.toBeInTheDocument();
  });

  it("opens the form when button is clicked", async () => {
    render(<PromptForm />);
    await userEvent.click(screen.getByRole("button", { name: /new prompt version/i }));
    expect(screen.getByText("Create New Prompt Version")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("System Prompt")).toBeInTheDocument();
    expect(screen.getByLabelText("User Prompt Template")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("closes the form when Cancel is clicked", async () => {
    render(<PromptForm />);
    await userEvent.click(screen.getByRole("button", { name: /new prompt version/i }));
    expect(screen.getByText("Create New Prompt Version")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText("Create New Prompt Version")).not.toBeInTheDocument();
  });

  it("pre-populates from active prompt", async () => {
    render(
      <PromptForm
        activePrompt={{
          systemPrompt: "Existing system prompt",
          userPromptTemplate: "Existing template",
        }}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /new prompt version/i }));
    expect(screen.getByLabelText("System Prompt")).toHaveValue("Existing system prompt");
    expect(screen.getByLabelText("User Prompt Template")).toHaveValue("Existing template");
  });

  it("submits the form and calls fetch then refresh", async () => {
    render(<PromptForm />);
    await userEvent.click(screen.getByRole("button", { name: /new prompt version/i }));

    await userEvent.type(screen.getByLabelText("Name"), "Test v1");
    await userEvent.type(screen.getByLabelText("System Prompt"), "System text");
    await userEvent.type(screen.getByLabelText("User Prompt Template"), "Template text");

    await userEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(global.fetch).toHaveBeenCalledWith("/api/prompts", expect.objectContaining({
      method: "POST",
    }));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
