import { prisma } from "../db/prisma";

export const getConversationHistory = async (conversationId: string) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });
};
