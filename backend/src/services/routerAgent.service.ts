import { classifyIntent } from "../utils/intentClassifier";
import { supportAgent, supportAgentStream } from "./supportAgent.service";
import { orderAgent, orderAgentStream } from "./orderAgent.service";
import { billingAgent, billingAgentStream } from "./billingAgent.service";
import { Message } from "@prisma/client";

export const routerAgent = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const intent = classifyIntent(message);

  switch (intent) {
    case "support":
      return supportAgent(conversationId, message, history);
    case "order":
      return orderAgent(conversationId, message, history);
    case "billing":
      return billingAgent(conversationId, message, history);
    default:
      return supportAgent(conversationId, message, history);
  }
};

export const routerAgentStream = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const intent = classifyIntent(message);

  switch (intent) {
    case "support":
      return supportAgentStream(conversationId, message, history);
    case "order":
      return orderAgentStream(conversationId, message, history);
    case "billing":
      return billingAgentStream(conversationId, message, history);
    default:
      return supportAgentStream(conversationId, message, history);
  }
};
