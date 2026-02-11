import { Box, Typography, List, ListItemButton, Button, Chip, Divider, IconButton } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chat.store";
import { chatService } from "../../services/chat.service";
import { agentService } from "../../services/agent.service";
import {
  classifyIntent,
  resolveConversationAgentType,
  type ChatAgentType
} from "../../utils/intentClassifier";

export default function Sidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const setConversations = useChatStore((s) => s.setConversations);
  const setMessages = useChatStore((s) => s.setMessages);
  const removeConversation = useChatStore((s) => s.removeConversation);

  const [agents, setAgents] = useState<{ type: string; description: string; tools?: string[] }[]>([]);
  const [agentsOpen, setAgentsOpen] = useState(false);

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

  const handleNewConversation = () => {
    const tempId = `temp-${Date.now().toString()}`;
    upsertLocalConversation({ id: tempId, title: "New conversation" });
    setMessages(tempId, []);
    setActiveConversation(tempId);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [agentList, convoList] = await Promise.all([
          agentService.getAgents(),
          chatService.getConversations(),
        ]);

        if (Array.isArray(agentList)) {
          const enriched = await Promise.all(
            agentList.map(async (agent: any) => {
              try {
                const caps = await agentService.getAgentCapabilities(agent.type);
                return { ...agent, tools: caps?.tools ?? [] };
              } catch {
                return agent;
              }
            })
          );
          setAgents(enriched);
        }

        if (Array.isArray(convoList)) {
          const mapped = convoList.map((item: any) => ({
            id: item.id,
            title: item.title ?? undefined
          }));
          const state = useChatStore.getState();
          const hadActiveConversation = Boolean(state.activeConversationId);
          const tempConversations = state.conversations.filter((conv) =>
            conv.id.startsWith("temp-")
          );
          const merged = [...tempConversations, ...mapped];
          setConversations(merged);
          if (mapped.length && !hadActiveConversation) {
            await loadConversation(mapped[0].id);
          }
        }
      } catch {
        // Keep sidebar usable even if one of the initial fetches fails.
      }
    };

    load();
  }, []);

  const loadConversation = async (id: string) => {
    const data = await chatService.getConversationById(id);

    let conversationAgentType: ChatAgentType | undefined;
    for (const msg of data.messages ?? []) {
      if (msg.role !== "user" || !msg.content) continue;

      const intent = classifyIntent(msg.content);
      if (intent === "order" || intent === "billing") {
        conversationAgentType = intent;
      } else if (!conversationAgentType) {
        conversationAgentType = resolveConversationAgentType(msg.content);
      }
    }

    const mapped = (data.messages ?? []).map((msg: any, idx: number) => ({
      id: msg.id ?? `${msg.role}-${idx}`,
      role: msg.role === "assistant" ? "agent" : "user",
      content: msg.content,
      agentType:
        msg.role === "assistant" ? conversationAgentType ?? "support" : undefined,
      status: "complete",
    }));
    setMessages(id, mapped);
    if (data?.title) {
      upsertLocalConversation({ id, title: data.title });
    }
    setActiveConversation(id);
  };

  const handleDelete = async (id: string) => {
    if (!id.startsWith("temp-")) {
      await chatService.deleteConversation(id);
    }
    removeConversation(id);
  };

  return (
    <Box
      sx={{
        width: 260,
        borderRight: "1px solid #ddd",
        p: 2,
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden"
      }}
    >
      <Box
        sx={{
          mb: 2,
          p: 1,
          border: "1px solid #ddd",
          borderRadius: 1,
          bgcolor: "#fafafa"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: agentsOpen ? 1 : 0
          }}
        >
          <Typography variant="h6">Agents</Typography>
          <IconButton
            size="small"
            onClick={() => setAgentsOpen((v) => !v)}
          >
            {agentsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {agentsOpen ? (
          <List>
            {agents.map((agent) => (
              <ListItemButton key={agent.type} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography fontWeight={600}>
                  {agent.type.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {agent.description}
                </Typography>
                {agent.tools?.length ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                    {agent.tools.map((tool) => (
                      <Chip key={tool} label={tool} size="small" />
                    ))}
                  </Box>
                ) : null}
              </ListItemButton>
            ))}
          </List>
        ) : null}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" mb={2}>
        Conversations
      </Typography>

      <Button
        variant="outlined"
        size="small"
        onClick={handleNewConversation}
        fullWidth
        sx={{ mb: 2 }}
      >
        + New Conversation
      </Button>

      <List>
        {conversations.map((conv) => {
          const last = messages[conv.id]?.[messages[conv.id].length - 1];
          const lastMessage = last?.content ?? "";
          const preview =
            lastMessage.length > 60
              ? `${lastMessage.slice(0, 60)}...`
              : lastMessage;

          return (
            <ListItemButton
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                backgroundColor: activeConversationId === conv.id ? "#e0f7fa" : "transparent",
                mb: 1,
                borderRadius: 1,
              }}
            >
              <Typography fontWeight={activeConversationId === conv.id ? "bold" : "normal"}>
                {conv.title ?? conv.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {preview || "No messages yet"}
              </Typography>
              <Button
                size="small"
                color="error"
                sx={{ mt: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(conv.id);
                }}
              >
                Delete
              </Button>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
