import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth/api-key";
import { authOptions } from "@/lib/auth/session";
import { createIngestBlockRuleSchema } from "@/lib/validators/ingest-blocklist";

export const dynamic = "force-dynamic";

function canReadIngestBlocklist(headers: Headers): boolean {
  if (process.env.BLOCKLIST_PUBLIC_READ === "true") {
    return true;
  }
  return validateApiKey(headers);
}

/**
 * Export enabled rules for n8n / automation (`X-API-Key`, or public if `BLOCKLIST_PUBLIC_READ=true`).
 */
export async function GET(request: Request) {
  if (!canReadIngestBlocklist(request.headers)) {
    return unauthorizedResponse();
  }

  const rules = await prisma.ingestBlockRule.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      pattern: true,
      scope: true,
      enabled: true,
      createdAt: true,
    },
  });

  const latest =
    rules.length > 0
      ? rules.reduce((max, r) => (r.createdAt > max ? r.createdAt : max), rules[0].createdAt)
      : new Date();

  return NextResponse.json(
    {
      version: 1,
      updatedAt: latest.toISOString(),
      rules: rules.map((r) => ({
        id: r.id,
        pattern: r.pattern,
        scope: r.scope,
        enabled: r.enabled,
      })),
    },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    }
  );
}

/** Create rule (dashboard session only). */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createIngestBlockRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { pattern, scope, note, enabled } = parsed.data;

  const rule = await prisma.ingestBlockRule.create({
    data: {
      pattern,
      scope,
      note: note ?? null,
      enabled,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}
