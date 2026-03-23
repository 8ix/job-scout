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

    const about = screen.getByTestId("nav-about-this-project");
    expect(about).toBeInTheDocument();
    expect(about.closest('[data-testid="sidebar-footer"]')).toBeTruthy();
    expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-opportunities")).toBeInTheDocument();
    expect(screen.getByTestId("nav-applications")).toBeInTheDocument();
    expect(screen.getByTestId("nav-disqualified")).toBeInTheDocument();
    expect(screen.getByTestId("nav-prompts")).toBeInTheDocument();
    expect(screen.getByTestId("nav-feeds")).toBeInTheDocument();
    expect(screen.getByTestId("nav-blocklist")).toBeInTheDocument();
  });

  it("renders the Job Scout title and brand image", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    expect(screen.getByText("Job Scout")).toBeInTheDocument();
    const img = document.querySelector('img[src="/brand-mini-owl.png"]');
    expect(img).toBeTruthy();
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

  it("renders count badges for opportunities, applications, disqualified, and feeds", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    expect(screen.getByTestId("nav-opportunities-count")).toHaveTextContent("42");
    expect(screen.getByTestId("nav-applications-count")).toHaveTextContent("5");
    expect(screen.getByTestId("nav-disqualified-count")).toHaveTextContent("12");
    expect(screen.getByTestId("nav-feeds-count")).toHaveTextContent("3");
  });

  it("does not render count badges for dashboard, prompts, and blocklist", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    expect(screen.queryByTestId("nav-dashboard-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-prompts-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-blocklist-count")).not.toBeInTheDocument();
  });
});
