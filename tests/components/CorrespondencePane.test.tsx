import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CorrespondencePane } from "@/components/applications/CorrespondencePane";

describe("CorrespondencePane", () => {
  it("shows empty state", () => {
    render(
      <CorrespondencePane opportunityId="o1" correspondence={[]} onUpdated={() => {}} />
    );
    expect(screen.getByText(/No correspondence saved yet/i)).toBeInTheDocument();
  });

  it("renders entries and opens form", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(
      <CorrespondencePane
        opportunityId="o1"
        correspondence={[
          {
            id: "c1",
            receivedAt: "2026-03-10T12:00:00.000Z",
            subject: "Thanks",
            body: "We received your application.",
            createdAt: "2026-03-10T14:00:00.000Z",
          },
        ]}
        onUpdated={() => {}}
      />
    );

    expect(screen.getByTestId("correspondence-entry-c1")).toBeInTheDocument();
    expect(screen.getByText("We received your application.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add entry/i }));
    expect(screen.getByTestId("correspondence-form")).toBeInTheDocument();
  });
});
