import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  it("renders all navigation links in the desktop sidebar", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    const about = screen.getAllByTestId("nav-about-this-project")[0];
    expect(about).toBeInTheDocument();
    expect(about.closest('[data-testid="sidebar-footer"]')).toBeTruthy();
    expect(screen.getAllByTestId("nav-dashboard")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-opportunities")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-applications")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-disqualified")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-search-criteria")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-feeds")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-blocklist")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("nav-settings")[0]).toBeInTheDocument();
  });

  it("renders the Job Scout title and brand image", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    expect(screen.getAllByText("Job Scout").length).toBeGreaterThanOrEqual(1);
    const img = document.querySelector('img[src="/brand-mini-owl.png"]');
    expect(img).toBeTruthy();
  });

  it("highlights the active route", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    const dashboardLinks = screen.getAllByTestId("nav-dashboard");
    expect(dashboardLinks.some((el) => el.className.includes("bg-primary"))).toBe(true);
  });

  it("renders sign out buttons", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    expect(screen.getAllByText("Sign out").length).toBeGreaterThanOrEqual(1);
  });

  it("renders count badges for opportunities, applications, disqualified, and feeds", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    expect(screen.getAllByTestId("nav-opportunities-count")[0]).toHaveTextContent("42");
    expect(screen.getAllByTestId("nav-applications-count")[0]).toHaveTextContent("5");
    expect(screen.getAllByTestId("nav-disqualified-count")[0]).toHaveTextContent("12");
    expect(screen.getAllByTestId("nav-feeds-count")[0]).toHaveTextContent("3");
  });

  it("does not render count badges for dashboard, search criteria, settings, and blocklist", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);

    expect(screen.queryByTestId("nav-dashboard-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-search-criteria-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-settings-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav-blocklist-count")).not.toBeInTheDocument();
  });

  it("renders the mobile header with a menu toggle", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    expect(screen.getByTestId("mobile-header")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-menu-toggle")).toBeInTheDocument();
  });

  it("opens the drawer when the mobile menu toggle is clicked", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("mobile-menu-toggle"));

    expect(screen.getByTestId("mobile-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("drawer-backdrop")).toBeInTheDocument();
  });

  it("closes the drawer when the backdrop is clicked", () => {
    render(<Sidebar navCounts={defaultNavCounts} />);
    fireEvent.click(screen.getByTestId("mobile-menu-toggle"));
    expect(screen.getByTestId("mobile-drawer")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("drawer-backdrop"));

    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
  });
});
