export const classifyIntent = (message: string) => {
  const text = message.toLowerCase();

  if (
    text.includes("invoice") ||
    text.includes("receipt") ||
    text.includes("billing") ||
    text.includes("refund") ||
    text.includes("payment")
  )
    return "billing";
  if (
    text.includes("order") ||
    text.includes("tracking") ||
    text.includes("track") ||
    text.includes("cancel") ||
    /[a-z0-9_-]{6,}/i.test(text.trim())
  )
    return "order";
  if (text.includes("help") || text.includes("support")) return "support";

  return "unknown";
};
