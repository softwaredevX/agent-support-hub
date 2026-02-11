import { Context } from "hono";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { getConversationHistory } from "../tools/conversation.tool";

const idSchema = z.string().min(1);
const deleteBodySchema = z.object({ id: z.string().min(1) });

export const listConversations = async (c: Context) => {
  const conversations = await prisma.conversation.findMany({
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  return c.json(conversations);
};

export const getConversation = async (c: Context) => {
  const id = idSchema.parse(c.req.param("id"));
  const convo = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, title: true }
  });
  const messages = await getConversationHistory(id);
  return c.json({
    conversationId: id,
    title: convo?.title ?? null,
    messages
  });
};

export const deleteConversation = async (c: Context) => {
  const id = idSchema.parse(c.req.param("id"));

  await prisma.message.deleteMany({
    where: { conversationId: id }
  });

  await prisma.conversation.delete({
    where: { id }
  });

  return c.json({ deleted: true, conversationId: id });
};

export const deleteConversationByBody = async (c: Context) => {
  const body = deleteBodySchema.parse(await c.req.json());
  const id = body.id;

  await prisma.message.deleteMany({
    where: { conversationId: id }
  });

  await prisma.conversation.delete({
    where: { id }
  });

  return c.json({ deleted: true, conversationId: id });
};
