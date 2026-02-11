import type { Message } from "./message.types";

export interface Conversation {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  messages?: Message[];
}
