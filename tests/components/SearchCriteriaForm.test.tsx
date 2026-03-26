import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchCriteriaForm } from "@/components/search-criteria/SearchCriteriaForm";
import { emptySearchCriteria } from "@/lib/search-criteria/schema";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        criteria: emptySearchCriteria(),
        updatedAt: new Date().toISOString(),
      }),
  })
) as unknown as typeof fetch;

describe("SearchCriteriaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sections and save", () => {
    const criteria = emptySearchCriteria();
    render(
      <SearchCriteriaForm
        initialCriteria={criteria}
        initialUpdatedAt={new Date("2026-03-01").toISOString()}
      />
    );
    expect(screen.getByRole("heading", { name: /where you want to work/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save search criteria/i })).toBeInTheDocument();
  });

  it("adds a positive bullet and saves via PATCH", async () => {
    const criteria = emptySearchCriteria();
    render(
      <SearchCriteriaForm
        initialCriteria={criteria}
        initialUpdatedAt={new Date().toISOString()}
      />
    );

    const addButtons = screen.getAllByRole("button", { name: /add bullet/i });
    await userEvent.click(addButtons[0]);
    const textbox = screen.getAllByPlaceholderText(/remote-first/i)[0];
    await userEvent.type(textbox, "Remote-first");

    await userEvent.click(screen.getByRole("button", { name: /save search criteria/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/search-criteria",
      expect.objectContaining({
        method: "PATCH",
      })
    );
    const call = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(call[1].body as string);
    expect(body.whereWork.positive).toContain("Remote-first");
    expect(mockRefresh).toHaveBeenCalled();
  });
});
