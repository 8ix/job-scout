import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApplicationsCsvImport } from "@/components/applications/ApplicationsCsvImport";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

describe("ApplicationsCsvImport", () => {
  it("is collapsed by default (no template link until expanded)", () => {
    render(<ApplicationsCsvImport />);
    expect(screen.getByTestId("applications-csv-import")).toBeInTheDocument();
    expect(screen.getByTestId("applications-csv-import-toggle")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /download csv template/i })).not.toBeInTheDocument();
  });

  it("expands to show template link and file input", () => {
    render(<ApplicationsCsvImport />);
    fireEvent.click(screen.getByTestId("applications-csv-import-toggle"));
    expect(screen.getByTestId("applications-csv-import-toggle")).toHaveAttribute("aria-expanded", "true");
    const a = screen.getByRole("link", { name: /download csv template/i });
    expect(a).toHaveAttribute("href", "/applications-import-template.csv");
    expect(screen.getByLabelText(/csv file/i)).toBeInTheDocument();
  });
});
