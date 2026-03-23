import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationsPipeline } from "@/components/applications/ApplicationsPipeline";
import type { PipelineApplication } from "@/components/applications/application-types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function buildApp(overrides: Partial<PipelineApplication> = {}): PipelineApplication {
  return {
    id: "a1",
    title: "Developer",
    company: "Acme",
    url: "https://example.com",
    source: "manual",
    score: 8,
    appliedAt: new Date().toISOString(),
    stage: "Applied",
    appliedVia: "Job Scout",
    contacts: [],
    scheduledEvents: [],
    stageLogs: [],
    correspondence: [],
    ...overrides,
  };
}

describe("ApplicationsPipeline", () => {
  it("shows empty pipeline message when no applications", () => {
    const { container } = render(<ApplicationsPipeline applications={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders band heading and company for an Offer-stage application", () => {
    const apps = [buildApp({ id: "o1", stage: "Offer", company: "BigCo" })];
    render(<ApplicationsPipeline applications={apps} />);
    expect(screen.getByRole("heading", { level: 3, name: "Offer" })).toBeInTheDocument();
    expect(screen.getByText("BigCo")).toBeInTheDocument();
  });

  it("renders Details button on card", () => {
    const apps = [buildApp({ stage: "Interview" })];
    render(<ApplicationsPipeline applications={apps} />);
    expect(screen.getByRole("button", { name: /details/i })).toBeInTheDocument();
  });
});
