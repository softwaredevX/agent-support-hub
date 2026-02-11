import type { Message } from "./message.types";
import type { Conversation } from "./conversation.types";

export interface SendMessageResponse {
  message: Message;
}

export interface ConversationListResponse {
  conversations: Conversation[];
}

export interface ConversationHistoryResponse {
  messages: Message[];
}
