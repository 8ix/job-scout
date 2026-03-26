import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/search-criteria/build-system-prompt";
import {
  emptySearchCriteria,
  parseSearchCriteriaJson,
  type SearchCriteria,
} from "@/lib/search-criteria/schema";

const DEFAULT_ID = "default";

function criteriaToJson(criteria: SearchCriteria): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(criteria)) as Prisma.InputJsonValue;
}

export async function ensureSearchCriteriaSettings() {
  const existing = await prisma.searchCriteriaSettings.findUnique({
    where: { id: DEFAULT_ID },
  });
  if (existing) return existing;

  const empty = emptySearchCriteria();
  return prisma.searchCriteriaSettings.create({
    data: {
      id: DEFAULT_ID,
      criteria: criteriaToJson(empty),
      systemPrompt: buildSystemPrompt(empty),
    },
  });
}

/** System prompt always rebuilt from stored criteria so template changes apply without re-save. */
export function resolvedSystemPrompt(criteriaJson: unknown): string {
  const criteria = parseSearchCriteriaJson(criteriaJson);
  return buildSystemPrompt(criteria);
}

export async function updateSearchCriteria(criteria: SearchCriteria) {
  const systemPrompt = buildSystemPrompt(criteria);
  return prisma.searchCriteriaSettings.upsert({
    where: { id: DEFAULT_ID },
    create: {
      id: DEFAULT_ID,
      criteria: criteriaToJson(criteria),
      systemPrompt,
    },
    update: {
      criteria: criteriaToJson(criteria),
      systemPrompt,
    },
  });
}
