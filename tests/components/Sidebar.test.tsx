import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/nav/Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

const defaultNavCounts = {
  opportunities: 42,
  applications: 5,
  rejections: 12,
  feeds: 3,
};

describe("Sidebar", () => {
  it("renders all navigation links", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-opportunities")).toBeInTheDocument();
    expect(screen.getByTestId("nav-applications")).toBeInTheDocument();
    expect(screen.getByTestId("nav-rejections")).toBeInTheDocument();
    expect(screen.getByTestId("nav-prompts")).toBeInTheDocument();
    expect(screen.getByTestId("nav-feeds")).toBeInTheDocument();
  });

  it("renders the Job Scout title", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    expect(screen.getByText("Job Scout")).toBeInTheDocument();
  });

  it("highlights the active route", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    const dashboardLink = screen.getByTestId("nav-dashboard");
    expect(dashboardLink.className).toContain("bg-primary");
  });

  it("renders sign out button", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("renders count badges for opportunities, applications, rejections, and feeds", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    expect(screen.getByTestId("nav-opportunities-count")).toHaveTextContent("42");
    expect(screen.getByTestId("nav-applications-count")).toHaveTextContent("5");
    expect(screen.getByTestId("nav-rejections-count")).toHaveTextContent("12");
    expect(screen.getByTestId("nav-feeds-count")).toHaveTextContent("3");
  });

  it("does not render count badges for dashboard and prompts", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    expect(screen.queryByTestId("nav-dashboard-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-prompts-count")).not.toBeInTheDocument();
  });
});
