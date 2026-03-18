import { prisma } from "@/lib/prisma";

export async function getValidSources(): Promise<string[]> {
  const feeds = await prisma.feed.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return feeds.map((f) => f.name);
}

export async function isValidSource(source: string): Promise<boolean> {
  const feed = await prisma.feed.findUnique({ where: { name: source } });
  return feed !== null;
}
