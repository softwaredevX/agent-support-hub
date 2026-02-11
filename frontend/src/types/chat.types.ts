import type { Message } from "./message.types";
import type { Conversation } from "./conversation.types";

export interface ChatState {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Message[];
  isTyping: boolean;
  isStreaming: boolean;
}
