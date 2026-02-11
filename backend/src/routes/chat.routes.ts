import { Hono } from "hono";
import { sendMessage } from "../controllers/chat.controller";
import {
  deleteConversation,
  getConversation,
  listConversations
} from "../controllers/conversation.controller";

const chat = new Hono();

chat.post("/messages", sendMessage);
chat.get("/conversations", listConversations);
chat.get("/conversations/:id", getConversation);
chat.delete("/conversations/delete/:id", deleteConversation);

export default chat;
