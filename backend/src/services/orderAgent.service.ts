import { Message } from "@prisma/client";
import { generateAgentText, streamAgentText, stringToStream } from "./ai.service";
import { getDeliveryStatus, getOrderDetails, updateOrderStatus } from "../tools/order.tool";

type OrderIdentifier = { kind: "id" | "tracking"; value: string };

type StatusHit = { raw: string; normalized: string } | null;

const normalizeStatus = (raw: string) => {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";

  if (cleaned === "cancel" || cleaned === "canceled" || cleaned === "cancelled") {
    return "cancelled";
  }
  if (cleaned === "in transit" || cleaned === "in-transit") return "in_transit";
  if (cleaned === "out for delivery") return "out_for_delivery";

  return cleaned.replace(/\s+/g, "_");
};

const extractOrderStatus = (text: string): StatusHit => {
  const lower = text.toLowerCase();
  if (/(cancel|cancelled|canceled)/.test(lower)) {
    return { raw: "cancelled", normalized: "cancelled" };
  }

  const patterns = [
    /status\s*(?:is|=|:|to)\s*([a-z][a-z\s_-]{1,30})/i,
    /set\s+status\s+to\s+([a-z][a-z\s_-]{1,30})/i,
    /mark\s+(?:it|order)?\s*as\s+([a-z][a-z\s_-]{1,30})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const normalized = normalizeStatus(match[1]);
      if (normalized) return { raw: match[1].trim(), normalized };
    }
  }

  return null;
};

const extractOrderIdentifier = (text: string): OrderIdentifier | null => {

  const trimmed = text.trim();
  console.log(/^[A-Za-z0-9_-]{6,}$/.test(trimmed));
  const uuidMatch = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
  );
  if (uuidMatch) {
    return { kind: "id", value: uuidMatch[0] };
  }

  const trackingMatch = text.match(
    /(tracking(?:\s*id)?|track(?:ing)?|order\s*id|order\s*#)\s*[:#-]?\s*([A-Za-z0-9_-]{6,})/i
  );
  if (trackingMatch) {
    return { kind: "tracking", value: trackingMatch[2] };
  }

  if (/^[A-Za-z0-9_-]{6,}$/.test(trimmed)) {
    return { kind: "tracking", value: trimmed };
  }

  return null;
};

const findIdentifierInHistory = (history: { content: string }[]) => {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const hit = extractOrderIdentifier(history[i].content);
    if (hit) return hit;
  }
  return null;
};

export const orderAgent = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const identifier =
    extractOrderIdentifier(message) || findIdentifierInHistory(history);
  const statusHit = extractOrderStatus(message);

  if (!identifier) {
    return "Please provide your order ID or tracking ID so I can check the status.";
  }

  let order =
    identifier.kind === "id"
      ? await getOrderDetails({ id: identifier.value })
      : await getOrderDetails({ trackingId: identifier.value });

  if (order && statusHit) {
    await updateOrderStatus(
      identifier.kind === "id"
        ? { id: identifier.value }
        : { trackingId: identifier.value },
      statusHit.normalized
    );
    order =
      identifier.kind === "id"
        ? await getOrderDetails({ id: identifier.value })
        : await getOrderDetails({ trackingId: identifier.value });
  }

  const delivery = await getDeliveryStatus(
    identifier.kind === "id"
      ? { id: identifier.value }
      : { trackingId: identifier.value }
  );

  return generateAgentText({
    agent: "order",
    message,
    history,
    toolData: {
      identifier,
      order,
      delivery
    }
  });
};

export const orderAgentStream = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const identifier =
    extractOrderIdentifier(message) || findIdentifierInHistory(history);
  const statusHit = extractOrderStatus(message);

  if (!identifier) {
    return stringToStream(
      "Please provide your order ID or tracking ID so I can check the status."
    );
  }

  let order =
    identifier.kind === "id"
      ? await getOrderDetails({ id: identifier.value })
      : await getOrderDetails({ trackingId: identifier.value });

  if (order && statusHit) {
    await updateOrderStatus(
      identifier.kind === "id"
        ? { id: identifier.value }
        : { trackingId: identifier.value },
      statusHit.normalized
    );
    order =
      identifier.kind === "id"
        ? await getOrderDetails({ id: identifier.value })
        : await getOrderDetails({ trackingId: identifier.value });
  }

  const delivery = await getDeliveryStatus(
    identifier.kind === "id"
      ? { id: identifier.value }
      : { trackingId: identifier.value }
  );

  return streamAgentText({
    agent: "order",
    message,
    history,
    toolData: {
      identifier,
      order,
      delivery
    }
  });
};
