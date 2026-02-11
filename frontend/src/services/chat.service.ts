const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export const chatService = {
  sendMessage: async (data: {
    conversationId?: string;
    message: string;
  }) => {
    const res = await fetch(`${API_BASE}/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  },
  streamMessage: async (
    data: { conversationId?: string; message: string },
    onEvent: (event: { type: string; data: any }) => void
  ) => {
    const res = await fetch(`${API_BASE}/chat/messages?stream=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        const lines = raw.split("\n");
        const eventLine = lines.find((line) => line.startsWith("event:"));
        const dataLine = lines.find((line) => line.startsWith("data:"));
        if (!eventLine || !dataLine) continue;

        const type = eventLine.replace("event:", "").trim();
        const json = dataLine.replace("data:", "").trim();
        const payload = json ? JSON.parse(json) : null;
        onEvent({ type, data: payload });
      }
    }
  },

  getConversations: async () => {
    const res = await fetch(`${API_BASE}/chat/conversations`);
    return res.json();
  },

  getConversationById: async (id: string) => {
    const res = await fetch(
      `${API_BASE}/chat/conversations/${id}`
    );
    return res.json();
  },

  deleteConversation: async (id: string) => {
    const res = await fetch(
      `${API_BASE}/chat/conversations/delete/${id}`,
      { method: "DELETE" }
    );
    return res.json();
  },
};
