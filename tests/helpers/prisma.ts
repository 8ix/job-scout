import { vi } from "vitest";

export const prismaMock = {
  opportunity: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    deleteMany: vi.fn(),
  },
  rejection: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    deleteMany: vi.fn(),
  },
  systemPrompt: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  feedHeartbeat: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(prismaMock)),
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
