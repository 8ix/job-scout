import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { authOptions } from "@/lib/auth/session";
import { createFeedSchema } from "@/lib/validators/feed";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const feeds = await prisma.feed.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(feeds);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const parsed = createFeedSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.feed.findUnique({
    where: { name: parsed.data.name },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A feed with this name already exists" },
      { status: 409 }
    );
  }

  const feed = await prisma.feed.create({ data: parsed.data });
  return NextResponse.json(feed, { status: 201 });
}
