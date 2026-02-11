import { prisma } from "../db/prisma";

const MAX_MESSAGES = Number(process.env.CONTEXT_MAX_MESSAGES ?? "20");
const KEEP_RECENT = Number(process.env.CONTEXT_KEEP_RECENT ?? "8");
const SUMMARY_MAX_CHARS = Number(process.env.CONTEXT_SUMMARY_MAX_CHARS ?? "900");

const buildSummary = (messages: { role: string; content: string }[]) => {
  const text = messages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n");
  if (text.length <= SUMMARY_MAX_CHARS) return text;
  return `${text.slice(0, SUMMARY_MAX_CHARS)}...`;
};

export const compactConversationIfNeeded = async (conversationId: string) => {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });

  if (messages.length <= MAX_MESSAGES) return;

  const cutoff = Math.max(messages.length - KEEP_RECENT, 0);
  const toSummarize = messages.slice(0, cutoff);
  if (!toSummarize.length) return;

  const summary = buildSummary(toSummarize);

  await prisma.$transaction([
    prisma.message.deleteMany({
      where: { id: { in: toSummarize.map((msg) => msg.id) } }
    }),
    prisma.message.create({
      data: {
        conversationId,
        role: "system",
        content: `Summary of earlier messages:\n${summary}`
      }
    })
  ]);
};
