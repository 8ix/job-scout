import { prisma } from "@/lib/prisma";

export type NavCounts = {
  opportunities: number;
  applications: number;
  rejections: number;
  feeds: number;
};

export async function getNavCounts(): Promise<NavCounts> {
  const [opportunities, applications, rejections, feeds] = await Promise.all([
    prisma.opportunity.count({ where: { status: "new" } }),
    prisma.opportunity.count({ where: { status: "applied" } }),
    prisma.rejection.count(),
    prisma.feed.count(),
  ]);

  return { opportunities, applications, rejections, feeds };
}
