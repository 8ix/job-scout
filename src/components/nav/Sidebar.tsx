"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { NavCounts } from "@/lib/nav-counts";

const navItems = [
  { href: "/about", label: "About this project", icon: "ℹ️", countKey: null as keyof NavCounts | null },
  { href: "/dashboard", label: "Dashboard", icon: "📊", countKey: null as keyof NavCounts | null },
  { href: "/opportunities", label: "Opportunities", icon: "💼", countKey: "opportunities" as const },
  { href: "/applications", label: "Applications", icon: "📋", countKey: "applications" as const },
  { href: "/rejections", label: "Disqualified", icon: "🚫", countKey: "rejections" as const },
  { href: "/prompts", label: "Prompts", icon: "📝", countKey: null },
  { href: "/feeds", label: "Feeds", icon: "📡", countKey: "feeds" as const },
];

interface SidebarProps {
  navCounts: NavCounts;
}

export function Sidebar({ navCounts }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-foreground">Job Scout</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const count = item.countKey ? navCounts[item.countKey] : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
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
                    isActive ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
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
      <div className="border-t border-border p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
