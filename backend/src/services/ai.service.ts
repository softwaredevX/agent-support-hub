import type { Message } from "@prisma/client";

type AgentType = "support" | "order" | "billing";

type AgentInput = {
  agent: AgentType;
  message: string;
  history: Message[];
  toolData?: Record<string, unknown>;
};

const HF_API_URL = process.env.HF_URL || 'https://router.huggingface.co/v1/chat/completions';

const getConfig = () => {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("Missing HF_API_KEY");
  }

  const model = process.env.HF_MODEL || "Qwen/Qwen3-Coder-Next:novita";
  return { apiKey, model };
};

const formatHistory = (history: Message[]) => {
  const recent = history.slice(-8);
  if (!recent.length) return "No previous messages.";
  return recent
    .map(entry => `${entry.role.toUpperCase()}: ${entry.content}`)
    .join("\n");
};

const systemPrompt = (agent: AgentType) => {
  switch (agent) {
    case "order":
      return "You are the Order Support Agent. Use the tool data to answer order status, tracking, modifications, and cancellations. Be concise and actionable.";
    case "billing":
      return "You are the Billing Support Agent. Use the tool data to answer payment issues, refunds, invoices, and subscriptions. Be concise and actionable.";
    default:
      return "You are the Support Agent. Use conversation context to answer general support, FAQs, and troubleshooting clearly.";
  }
};

const buildPrompt = (input: AgentInput) => {
  const toolBlock = input.toolData
    ? JSON.stringify(input.toolData, null, 2)
    : "No tool data.";

  return [
    `Conversation history:\n${formatHistory(input.history)}`,
    `User message:\n${input.message}`,
    `Tool data:\n${toolBlock}`,
    "Respond to the user based on the tool data and history. If tool data is missing or empty, ask for what is needed."
  ].join("\n\n");
};

const buildMessages = (input: AgentInput) => [
  { role: "system", content: systemPrompt(input.agent) },
  { role: "user", content: buildPrompt(input) }
];

export const generateAgentText = async (input: AgentInput) => {
  const { apiKey, model } = getConfig();

  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(input),
      stream: false
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HF request failed: ${res.status}`);
  }

  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() ?? "";
};

export const streamAgentText = async (input: AgentInput) => {
  const { apiKey, model } = getConfig();

  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(input),
      stream: true
    })
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    throw new Error(text || `HF request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  async function* iterate() {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        const line = raw
          .split("\n")
          .find(entry => entry.startsWith("data:"));
        if (!line) continue;

        const data = line.replace("data:", "").trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // ignore malformed chunk
        }
      }
    }
  }

  return iterate();
};

export const stringToStream = async function* (text: string) {
  yield text;
};
