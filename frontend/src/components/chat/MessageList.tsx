import { Box } from "@mui/material";
import MessageBubble from "./MessageBubble";
import { useChatStore } from "../../store/chat.store";
import { useEffect, useRef } from "react";

const EMPTY_MESSAGES: never[] = [];

export default function MessageList() {
  const messages = useChatStore((s) => {
    const id = s.activeConversationId;
    if (!id) return EMPTY_MESSAGES;
    return s.messages[id] ?? EMPTY_MESSAGES;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box
      ref={containerRef}
      sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1 }}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </Box>
  );
}
