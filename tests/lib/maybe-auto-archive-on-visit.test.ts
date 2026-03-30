import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { AUTO_ARCHIVE_PAGE_LOAD_MIN_INTERVAL_MS } from "@/lib/constants/applications-ui";
import { maybeAutoArchiveOnVisit } from "@/lib/applications/maybe-auto-archive-on-visit";

describe("maybeAutoArchiveOnVisit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips when last run is within the throttle window", async () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const recent = new Date(now.getTime() - AUTO_ARCHIVE_PAGE_LOAD_MIN_INTERVAL_MS / 2);
    prismaMock.applicationWorkflowSettings.findUnique.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
      lastAutoArchiveAt: recent,
    });

    const result = await maybeAutoArchiveOnVisit(now);
    expect(result).toEqual({ archived: 0, ran: false });
    expect(prismaMock.opportunity.findMany).not.toHaveBeenCalled();
    expect(prismaMock.applicationWorkflowSettings.update).not.toHaveBeenCalled();
  });

  it("runs when lastAutoArchiveAt is null", async () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    prismaMock.applicationWorkflowSettings.findUnique.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
      lastAutoArchiveAt: null,
    });
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.applicationWorkflowSettings.update.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
      lastAutoArchiveAt: now,
    });

    const result = await maybeAutoArchiveOnVisit(now);
    expect(result.ran).toBe(true);
    expect(result.archived).toBe(0);
    expect(prismaMock.applicationWorkflowSettings.update).toHaveBeenCalledWith({
      where: { id: "default" },
      data: { lastAutoArchiveAt: now },
    });
  });

  it("runs when last run is older than the throttle window", async () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const old = new Date(now.getTime() - AUTO_ARCHIVE_PAGE_LOAD_MIN_INTERVAL_MS - 1000);
    prismaMock.applicationWorkflowSettings.findUnique.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
      lastAutoArchiveAt: old,
    });
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.applicationWorkflowSettings.update.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
      lastAutoArchiveAt: now,
    });

    const result = await maybeAutoArchiveOnVisit(now);
    expect(result.ran).toBe(true);
    expect(prismaMock.applicationWorkflowSettings.update).toHaveBeenCalled();
  });
});
