"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RestoreApplicationButtonProps {
  opportunityId: string;
}

export function RestoreApplicationButton({ opportunityId }: RestoreApplicationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/unarchive`, {
        method: "POST",
      });
      if (res.ok) {
        router.push("/applications");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleRestore}
      data-testid="restore-application-btn"
      className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50 transition-colors"
    >
      {loading ? "Restoring\u2026" : "Restore to pipeline"}
    </button>
  );
}
