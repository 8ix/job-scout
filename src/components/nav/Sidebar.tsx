"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { NavCounts } from "@/lib/nav-counts";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", countKey: null as keyof NavCounts | null },
  { href: "/opportunities", label: "Opportunities", icon: "💼", countKey: "opportunities" as const },
  { href: "/applications", label: "Applications", icon: "📋", countKey: "applications" as const },
  { href: "/rejections", label: "Disqualified", icon: "🚫", countKey: "rejections" as const },
  { href: "/search-criteria", label: "Search criteria", icon: "🎯", countKey: null },
  { href: "/feeds", label: "Feeds", icon: "📡", countKey: "feeds" as const },
  { href: "/ingest-blocklist", label: "Blocklist", icon: "🧱", countKey: null },
  { href: "/settings", label: "Settings", icon: "⚙️", countKey: null },
];

interface SidebarProps {
  navCounts: NavCounts;
}

function SidebarContent({
  navCounts,
  pathname,
  onNavigate,
}: {
  navCounts: NavCounts;
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 md:h-20 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 min-w-0"
          onClick={onNavigate}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset in /public */}
          <img
            src="/brand-mini-owl.png"
            alt=""
            width={72}
            height={72}
            className="h-12 w-12 md:h-[72px] md:w-[72px] shrink-0 object-contain"
          />
          <h1 className="text-lg md:text-xl font-bold text-foreground truncate">
            Job Scout
          </h1>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const count = item.countKey ? navCounts[item.countKey] : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              onClick={onNavigate}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 md:py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              {count !== undefined && (
                <span
                  className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-medium ${
                    isActive
                      ? "bg-primary-foreground/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}-count`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div
        className="border-t border-border p-4 space-y-1"
        data-testid="sidebar-footer"
      >
        <Link
          href="/about"
          data-testid="nav-about-this-project"
          onClick={onNavigate}
          className="flex w-full rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          About this project
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export function Sidebar({ navCounts }: SidebarProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile top bar (below md) ── */}
      <header
        className="z-40 flex shrink-0 md:hidden items-center justify-between border-b border-border bg-card px-4 py-2"
        data-testid="mobile-header"
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          data-testid="mobile-menu-toggle"
          className="rounded-lg p-2 text-foreground hover:bg-muted transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand-mini-owl.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-base font-bold text-foreground">Job Scout</span>
        </Link>
        <div className="w-10" />
      </header>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" data-testid="mobile-drawer">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeDrawer}
            data-testid="drawer-backdrop"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-xl animate-slide-in-left">
            <SidebarContent
              navCounts={navCounts}
              pathname={pathname}
              onNavigate={closeDrawer}
            />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-border bg-card">
        <SidebarContent navCounts={navCounts} pathname={pathname} />
      </aside>
    </>
  );
}
