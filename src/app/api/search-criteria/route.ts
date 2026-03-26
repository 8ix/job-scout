import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { resolvedSystemPrompt, ensureSearchCriteriaSettings, updateSearchCriteria } from "@/lib/search-criteria/db";
import { patchSearchCriteriaSchema, parseSearchCriteriaJson } from "@/lib/search-criteria/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const row = await ensureSearchCriteriaSettings();
  const criteria = parseSearchCriteriaJson(row.criteria);
  const systemPrompt = resolvedSystemPrompt(row.criteria);

  return NextResponse.json({
    criteria,
    systemPrompt,
    updatedAt: row.updatedAt.toISOString(),
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const payload = body?.criteria !== undefined ? body.criteria : body;
  const parsed = patchSearchCriteriaSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const row = await updateSearchCriteria(parsed.data);
  return NextResponse.json({
    criteria: parseSearchCriteriaJson(row.criteria),
    systemPrompt: row.systemPrompt,
    updatedAt: row.updatedAt.toISOString(),
  });
}
