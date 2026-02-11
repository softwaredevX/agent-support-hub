import { Context } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";
import {
  buildResponse,
  buildResponseStream,
  ensureConversation,
  saveMessage,
  setConversationTitleIfEmpty
} from "../services/chat.service";

const messageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1)
});

const toSse = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export const sendMessage = async (c: Context) => {
  const body = messageSchema.parse(await c.req.json());
  const wantsStream =
    c.req.query("stream") === "true" ||
    c.req.header("accept")?.includes("text/event-stream");

  if (!wantsStream) {
    const convo = await ensureConversation(body.conversationId);
    await saveMessage(convo.id, "user", body.message);
    await setConversationTitleIfEmpty(convo.id, body.message);

    const response = await buildResponse(convo.id, body.message);
    await saveMessage(convo.id, "assistant", response);

    return c.json({ conversationId: convo.id, response });
  }

  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  return stream(c, async stream => {
    const convo = await ensureConversation(body.conversationId);
    await saveMessage(convo.id, "user", body.message);
    await setConversationTitleIfEmpty(convo.id, body.message);

    await stream.write(toSse("typing", { status: "start" }));

    const responseStream = await buildResponseStream(convo.id, body.message);
    let fullResponse = "";
    for await (const chunk of responseStream) {
      fullResponse += chunk;
      await stream.write(toSse("message", { chunk }));
    }

    await saveMessage(convo.id, "assistant", fullResponse);

    await stream.write(toSse("typing", { status: "end" }));
    await stream.write(toSse("done", { conversationId: convo.id }));
  });
};
