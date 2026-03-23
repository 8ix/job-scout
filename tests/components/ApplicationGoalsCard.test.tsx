import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationGoalsCard } from "@/components/dashboard/ApplicationGoalsCard";
import type { ApplicationGoalsDashboardDTO } from "@/lib/goals/application-goal-progress";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const baseSettings = {
  id: "default",
  timezone: "UTC",
  weekStartsOn: 1,
  weeklyTargetCount: 0,
  monthlyTargetCount: 0,
};

describe("ApplicationGoalsCard", () => {
  it("shows dashed placeholders when both targets are off", () => {
    const initial: ApplicationGoalsDashboardDTO = {
      settings: { ...baseSettings },
      weekly: null,
      monthly: null,
    };
    render(<ApplicationGoalsCard initial={initial} />);
    expect(screen.getAllByText(/No goal set/i)).toHaveLength(2);
  });

  it("renders weekly progress when weekly goal is enabled", () => {
    const initial: ApplicationGoalsDashboardDTO = {
      settings: { ...baseSettings, weeklyTargetCount: 5 },
      weekly: {
        enabled: true,
        target: 5,
        currentCount: 2,
        previousCount: 5,
        currentHit: false,
        previousHit: true,
        currentStartIso: "2025-03-10T00:00:00.000Z",
        currentEndIso: "2025-03-17T00:00:00.000Z",
        previousStartIso: "2025-03-03T00:00:00.000Z",
        previousEndIso: "2025-03-10T00:00:00.000Z",
        currentLabel: "Mar 10 – Mar 16, 2025",
        previousLabel: "Mar 3 – Mar 9, 2025",
      },
      monthly: null,
    };
    render(<ApplicationGoalsCard initial={initial} />);
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    expect(screen.getByTestId("weekly-progress-bar")).toBeInTheDocument();
    expect(screen.getByText(/No goal set/i)).toBeInTheDocument();
  });

  it("opens edit form and submits PATCH", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        settings: { ...baseSettings, weeklyTargetCount: 3 },
        weekly: null,
        monthly: null,
      }),
    });

    const initial: ApplicationGoalsDashboardDTO = {
      settings: { ...baseSettings },
      weekly: null,
      monthly: null,
    };
    render(<ApplicationGoalsCard initial={initial} />);

    await user.click(screen.getByRole("button", { name: /edit goals/i }));
    expect(screen.getByTestId("application-goals-form")).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/weekly target/i));
    await user.type(screen.getByLabelText(/weekly target/i), "3");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/preferences/application-goals",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining('"weeklyTargetCount":3'),
      })
    );
  });
});
