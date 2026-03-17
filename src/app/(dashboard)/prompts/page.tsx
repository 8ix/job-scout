import { prisma } from "@/lib/prisma";
import { PromptList } from "@/components/prompts/PromptList";
import { PromptForm } from "@/components/prompts/PromptForm";

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const prompts = await prisma.systemPrompt.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activePrompt = prompts.find((p) => p.isActive) || null;

  const serialized = prompts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Prompts</h2>
      </div>
      <PromptForm activePrompt={activePrompt} />
      <PromptList prompts={serialized} />
    </div>
  );
}
