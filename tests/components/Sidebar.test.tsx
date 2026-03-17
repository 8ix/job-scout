import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/nav/Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("Sidebar", () => {
  it("renders all navigation links", () => {
    render(<Sidebar />);

    expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-opportunities")).toBeInTheDocument();
    expect(screen.getByTestId("nav-rejections")).toBeInTheDocument();
    expect(screen.getByTestId("nav-prompts")).toBeInTheDocument();
    expect(screen.getByTestId("nav-feed-health")).toBeInTheDocument();
    expect(screen.getByTestId("nav-cv")).toBeInTheDocument();
  });

  it("renders the Job Scout title", () => {
    render(<Sidebar />);
    expect(screen.getByText("Job Scout")).toBeInTheDocument();
  });

  it("shows CV link as disabled with 'Soon' label", () => {
    render(<Sidebar />);
    const cvItem = screen.getByTestId("nav-cv");
    expect(cvItem).toHaveClass("cursor-not-allowed");
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("highlights the active route", () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByTestId("nav-dashboard");
    expect(dashboardLink.className).toContain("bg-primary");
  });

  it("renders sign out button", () => {
    render(<Sidebar />);
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });
});
