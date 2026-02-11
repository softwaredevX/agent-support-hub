import { Message } from "@prisma/client";
import { generateAgentText, streamAgentText, stringToStream } from "./ai.service";
import { getInvoiceDetails, getRefundStatus } from "../tools/billing.tool";

const extractInvoiceId = (text: string) => {
  const uuidMatch = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
  );
  if (uuidMatch) return uuidMatch[0];

  const invoiceMatch = text.match(
    /(invoice(?:\s*id)?|receipt)\s*[:#-]?\s*([A-Za-z0-9_-]{6,})/i
  );
  if (invoiceMatch) return invoiceMatch[2];

  return null;
};

const findInvoiceInHistory = (history: { content: string }[]) => {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const hit = extractInvoiceId(history[i].content);
    if (hit) return hit;
  }
  return null;
};

export const billingAgent = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const invoiceId =
    extractInvoiceId(message) || findInvoiceInHistory(history);

  if (!invoiceId) {
    return "Please provide your invoice ID so I can check billing details.";
  }

  const invoice = await getInvoiceDetails(invoiceId);
  const refund = await getRefundStatus(invoiceId);

  return generateAgentText({
    agent: "billing",
    message,
    history,
    toolData: {
      invoiceId,
      invoice,
      refund
    }
  });
};

export const billingAgentStream = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const invoiceId =
    extractInvoiceId(message) || findInvoiceInHistory(history);

  if (!invoiceId) {
    return stringToStream(
      "Please provide your invoice ID so I can check billing details."
    );
  }

  const invoice = await getInvoiceDetails(invoiceId);
  const refund = await getRefundStatus(invoiceId);

  return streamAgentText({
    agent: "billing",
    message,
    history,
    toolData: {
      invoiceId,
      invoice,
      refund
    }
  });
};
