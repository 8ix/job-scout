import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IngestBlocklistManager } from "@/components/ingest-blocklist/IngestBlocklistManager";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("IngestBlocklistManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no rules", () => {
    render(<IngestBlocklistManager rules={[]} />);
    expect(screen.getByText(/No block rules yet/i)).toBeInTheDocument();
  });

  it("renders rules table", () => {
    render(
      <IngestBlocklistManager
        rules={[
          {
            id: "r1",
            pattern: "Acme",
            scope: "company",
            note: null,
            enabled: true,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />
    );
    expect(screen.getByTestId("ingest-blocklist-table")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("submits new rule via POST", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    render(<IngestBlocklistManager rules={[]} />);
    await user.type(screen.getByTestId("ingest-blocklist-pattern-input"), "BadCo");
    await user.click(screen.getByTestId("ingest-blocklist-submit"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/ingest-blocklist",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("BadCo"),
      })
    );
  });
});
