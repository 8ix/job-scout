"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function MobileHeader() {
  const [loading, setLoading] = useState(false);

  async function goDesktop() {
    setLoading(true);
    try {
      const res = await fetch("/api/preferences/desktop", { method: "POST" });
      if (res.ok) {
        window.location.href = "/dashboard";
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-foreground">Job Scout</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goDesktop}
            disabled={loading}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            {loading ? "…" : "Desktop site"}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
