import { prisma } from "../db/prisma";
import { routerAgent, routerAgentStream } from "./routerAgent.service";
import { getConversationHistory } from "../tools/conversation.tool";
import { compactConversationIfNeeded } from "./context.service";

export const ensureConversation = async (conversationId?: string) => {
  if (conversationId) return { id: conversationId, isNew: false };
  const convo = await prisma.conversation.create({ data: {} });
  return { id: convo.id, isNew: true };
};

export const setConversationTitleIfEmpty = async (
  conversationId: string,
  message: string
) => {
  const title = message.trim().slice(0, 60);
  if (!title) return;

  await prisma.conversation.updateMany({
    where: { id: conversationId, title: null },
    data: { title }
  });
};

export const saveMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string
) => {
  await prisma.message.create({
    data: {
      conversationId,
      role,
      content
    }
  });
};

export const buildResponse = async (
  conversationId: string,
  message: string
) => {
  await compactConversationIfNeeded(conversationId);
  const history = await getConversationHistory(conversationId);
  return routerAgent(conversationId, message, history);
};

export const buildResponseStream = async (
  conversationId: string,
  message: string
) => {
  await compactConversationIfNeeded(conversationId);
  const history = await getConversationHistory(conversationId);
  return routerAgentStream(conversationId, message, history);
};

export const handleMessage = async (
  conversationId: string | undefined,
  message: string
) => {
  const convo = await ensureConversation(conversationId);
  await saveMessage(convo.id, "user", message);
  await setConversationTitleIfEmpty(convo.id, message);

  const response = await buildResponse(convo.id, message);
  await saveMessage(convo.id, "assistant", response);

  return { conversationId: convo.id, response };
};
