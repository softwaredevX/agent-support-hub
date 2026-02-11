import { Box, TextField, Button } from "@mui/material";
import { useState } from "react";
import { useChatStore } from "../../store/chat.store";
import { chatService } from "../../services/chat.service";

export default function MessageInput() {
  const [text, setText] = useState("");
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const replaceConversationId = useChatStore((s) => s.replaceConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const setConversations = useChatStore((s) => s.setConversations);

  const upsertLocalConversation = (conv: { id: string; title?: string }) => {
    const state = useChatStore.getState();
    const exists = state.conversations.find((c) => c.id === conv.id);
    const updated = exists
      ? state.conversations.map((c) =>
          c.id === conv.id ? { ...c, ...conv } : c
        )
      : [conv, ...state.conversations];
    setConversations(updated);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    const tempId =
      activeConversationId ?? `temp-${Date.now().toString()}`;
    if (!activeConversationId) {
      setActiveConversation(tempId);
      upsertLocalConversation({ id: tempId, title: text.trim().slice(0, 60) });
    }

    addMessage(tempId, {
      id: Date.now().toString(),
      role: "user",
      content: text,
      status: "complete",
    });

    setText("");
    setTyping(true);

    const agentMessageId = `agent-${Date.now().toString()}`;
    const msgLower = text.toLowerCase();
    let agentType: "support" | "order" | "billing" = "support";
    if (msgLower.includes("order") || msgLower.includes("tracking")) agentType = "order";
    if (msgLower.includes("payment") || msgLower.includes("refund")) agentType = "billing";

    addMessage(tempId, {
      id: agentMessageId,
      role: "agent",
      content: "",
      agentType,
      status: "streaming",
    });

    const conversationIdToSend =
      activeConversationId && activeConversationId.startsWith("temp-")
        ? undefined
        : activeConversationId ?? undefined;

    try {
      await chatService.streamMessage(
        {
          conversationId: conversationIdToSend,
          message: text,
        },
        (event) => {
          if (event.type === "typing") {
            setTyping(event.data?.status === "start");
          }

          if (event.type === "message") {
            const prev = (event.data?.chunk ?? "").toString();
            updateMessage(
              tempId,
              agentMessageId,
              (useChatStore.getState().messages[tempId]?.find((m) => m.id === agentMessageId)?.content || "") + prev
            );
          }

          if (event.type === "done") {
            const convoId = event.data?.conversationId;
            if (convoId && tempId !== convoId) {
              replaceConversationId(tempId, convoId);
            }

            chatService.getConversations().then((list) => {
              if (Array.isArray(list)) {
                setConversations(
                  list.map((item: any) => ({ id: item.id, title: item.title ?? undefined }))
                );
              }
            });
          }
        }
      );
    } catch {
      updateMessage(tempId, agentMessageId, "Failed to send message.");
    } finally {
      setTyping(false);
    }
  };

  return (
    <Box sx={{ display: "flex", p: 2, gap: 1 }}>
      <TextField
        fullWidth
        size="small"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a message..."
      />
      <Button variant="contained" onClick={handleSend}>
        Send
      </Button>
    </Box>
  );
}
