import { NextResponse } from "next/server";
import { resolvedSystemPrompt, ensureSearchCriteriaSettings } from "@/lib/search-criteria/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const row = await ensureSearchCriteriaSettings();
  const systemPrompt = resolvedSystemPrompt(row.criteria);

  return NextResponse.json({
    systemPrompt,
    updatedAt: row.updatedAt.toISOString(),
  });
}
