import { create } from "zustand";
import type { Message } from "../types/message.types";

export type Conversation = {
  id: string;
  title?: string;
};

type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  isTyping: boolean;

  setConversations: (c: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, msgs: Message[]) => void;
  addMessage: (conversationId: string, msg: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  upsertConversation: (conv: Conversation) => void;
  replaceConversationId: (oldId: string, newId: string) => void;
  removeConversation: (id: string) => void;
  setTyping: (v: boolean) => void;
};

const areConversationsEqual = (a: Conversation[], b: Conversation[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].id !== b[i].id || a[i].title !== b[i].title) return false;
  }
  return true;
};

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isTyping: false,

  setConversations: (c) =>
    set((state) => {
      const nextActiveConversationId =
        state.activeConversationId &&
        c.some((conv) => conv.id === state.activeConversationId)
          ? state.activeConversationId
          : c[0]?.id || null;

      if (
        areConversationsEqual(state.conversations, c) &&
        state.activeConversationId === nextActiveConversationId
      ) {
        return state;
      }

      return {
        conversations: c,
        activeConversationId: nextActiveConversationId,
      };
    }),

  setActiveConversation: (id) =>
    set((state) => {
      const alreadyInitialized = id ? Boolean(state.messages[id]) : true;
      if (state.activeConversationId === id && alreadyInitialized) {
        return state;
      }

      return {
        activeConversationId: id,
        // initialize empty messages if not exist
        messages: id
          ? {
              ...state.messages,
              [id]: state.messages[id] || [],
            }
          : state.messages,
      };
    }),

  setMessages: (conversationId, msgs) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: msgs,
      },
    })),

  addMessage: (conversationId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), msg],
      },
    })),

  updateMessage: (conversationId, messageId, content) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, content } : msg
        ),
      },
    })),

  upsertConversation: (conv) =>
    set((state) => {
      const exists = state.conversations.find((c) => c.id === conv.id);
      const updated = exists
        ? state.conversations.map((c) =>
            c.id === conv.id ? { ...c, ...conv } : c
          )
        : [conv, ...state.conversations];
      return { conversations: updated };
    }),

  replaceConversationId: (oldId, newId) =>
    set((state) => {
      const msgs = state.messages[oldId] || [];
      const { [oldId]: _, ...rest } = state.messages;
      const oldConv = state.conversations.find((conv) => conv.id === oldId);
      const filtered = state.conversations.filter((conv) => conv.id !== oldId);
      const updatedConversations = filtered.some((conv) => conv.id === newId)
        ? filtered
        : [{ id: newId, title: oldConv?.title }, ...filtered];

      return {
        messages: { ...rest, [newId]: msgs },
        conversations: updatedConversations,
        activeConversationId:
          state.activeConversationId === oldId
            ? newId
            : state.activeConversationId,
      };
    }),

  removeConversation: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.messages;
      return {
        messages: rest,
        conversations: state.conversations.filter((conv) => conv.id !== id),
        activeConversationId:
          state.activeConversationId === id ? null : state.activeConversationId,
      };
    }),

  setTyping: (v) =>
    set((state) => (state.isTyping === v ? state : { isTyping: v })),
}));
