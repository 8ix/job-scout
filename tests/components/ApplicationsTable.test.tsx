import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("ApplicationsTable", () => {
  it("shows empty message when no applications", () => {
    render(<ApplicationsTable applications={[]} />);
    expect(
      screen.getByText(/No applied jobs yet. Mark opportunities as applied from the Opportunities page./)
    ).toBeInTheDocument();
  });

  it("renders application with age in days", () => {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    render(
      <ApplicationsTable
        applications={[
          {
            id: "1",
            title: "Developer",
            company: "Acme",
            url: "https://example.com",
            source: "Adzuna",
            score: 8,
            appliedAt: fourDaysAgo.toISOString(),
            stage: "Applied",
            contacts: [],
          },
        ]}
      />
    );

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("4 days")).toBeInTheDocument();
  });

  it("shows Stale badge when application is 30+ days old", () => {
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    render(
      <ApplicationsTable
        applications={[
          {
            id: "1",
            title: "Engineer",
            company: "Beta",
            url: "https://example.com",
            source: "Reed",
            score: 7,
            appliedAt: fortyDaysAgo.toISOString(),
            stage: "Applied",
            contacts: [],
          },
        ]}
      />
    );

    expect(screen.getByText("40 days")).toBeInTheDocument();
    expect(screen.getByText("Stale")).toBeInTheDocument();
  });
});
