export type ChatAgentType = "support" | "order" | "billing";
export type IntentType = ChatAgentType | "unknown";

const ORDER_ID_REGEX = /[a-z0-9_-]{6,}/i;

export const classifyIntent = (message: string): IntentType => {
  const text = message.toLowerCase();

  if (
    text.includes("invoice") ||
    text.includes("receipt") ||
    text.includes("billing") ||
    text.includes("refund") ||
    text.includes("payment")
  ) {
    return "billing";
  }

  if (
    text.includes("order") ||
    text.includes("tracking") ||
    text.includes("track") ||
    text.includes("cancel") ||
    ORDER_ID_REGEX.test(text.trim())
  ) {
    return "order";
  }

  if (text.includes("help") || text.includes("support")) {
    return "support";
  }

  return "unknown";
};

export const resolveConversationAgentType = (
  message: string,
  existingType?: ChatAgentType
): ChatAgentType => {
  const nextIntent = classifyIntent(message);

  if (nextIntent === "order" || nextIntent === "billing") {
    return nextIntent;
  }

  if (existingType === "order" || existingType === "billing") {
    return existingType;
  }

  return nextIntent === "support" ? "support" : existingType ?? "support";
};
