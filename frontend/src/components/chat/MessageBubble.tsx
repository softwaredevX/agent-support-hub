import { Box, Paper, Avatar, Typography, Chip } from "@mui/material";
import type { Message } from "../../types/message.types";
import TypingIndicator from "./TypingIndicator";

type Props = { message: Message };

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  // Agent info for badges and avatars
  const agentInfo = {
    support: { avatar: "🛠️", badge: "Support", color: "#e0f7fa" },
    order: { avatar: "📦", badge: "Order", color: "#fff3e0" },
    billing: { avatar: "💰", badge: "Billing", color: "#fce4ec" },
  };

  const avatar = isUser ? "👤" : agentInfo[message.agentType as keyof typeof agentInfo]?.avatar || "🤖";
  const badge = !isUser ? agentInfo[message.agentType as keyof typeof agentInfo]?.badge : "";
  const bubbleColor = isUser
    ? "#1976d2" // user bubble
    : agentInfo[message.agentType as keyof typeof agentInfo]?.color || "#e0f7fa";

  const isStreamingEmpty =
    message.role === "agent" && message.status === "streaming" && !message.content;

  return (
    <Box
      sx={{
        display: "flex",
        mb: 1,
        gap: 1,
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      <Avatar sx={{ width: 28, height: 28 }}>{avatar}</Avatar>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, maxWidth: "70%" }}>
        {/* Badge for agent */}
        {badge && (
          <Chip
            label={badge}
            size="small"
            color="primary"
            sx={{ fontSize: 10, alignSelf: "flex-start" }}
          />
        )}

        {/* Message bubble */}
        <Paper
          sx={{
            p: 1.5,
            bgcolor: bubbleColor,
            color: isUser ? "#fff" : "#000",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {isStreamingEmpty ? (
            <TypingIndicator />
          ) : (
            <Typography variant="body2">
              {message.content}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
