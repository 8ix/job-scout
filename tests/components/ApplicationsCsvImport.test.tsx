import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationsCsvImport } from "@/components/applications/ApplicationsCsvImport";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

describe("ApplicationsCsvImport", () => {
  it("renders import section and template link", () => {
    render(<ApplicationsCsvImport />);
    expect(screen.getByTestId("applications-csv-import")).toBeInTheDocument();
    expect(screen.getByText(/Import from CSV/i)).toBeInTheDocument();
    const a = screen.getByRole("link", { name: /download csv template/i });
    expect(a).toHaveAttribute("href", "/applications-import-template.csv");
  });
});
