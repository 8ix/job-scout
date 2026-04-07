"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
}

export function Pagination({ total, page, limit }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  function goTo(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs sm:text-sm disabled:opacity-50 hover:bg-muted transition-colors"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs sm:text-sm disabled:opacity-50 hover:bg-muted transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
