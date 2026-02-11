import { Box, Typography } from "@mui/material";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChatStore } from "../../store/chat.store";

export default function ChatWindow() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid #ddd", bgcolor: "#e0f7fa" }}>
        <Typography variant="h6">
          {activeConversation
            ? activeConversation.title ?? activeConversation.id
            : "New conversation"}
        </Typography>
      </Box>

      {/* Messages */}
      <MessageList />

      {/* Message input */}
      <MessageInput />

      {/* Typing dots animation */}
      <style>{`
        @keyframes typingDots {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </Box>
  );
}
