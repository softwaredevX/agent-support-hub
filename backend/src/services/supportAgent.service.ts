import { Message } from "@prisma/client";
import { generateAgentText, streamAgentText } from "./ai.service";
import { getFaqEntries, searchFaq } from "../tools/faq.tool";

export const supportAgent = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const faq = await getFaqEntries();
  const matches = await searchFaq(message);

  return generateAgentText({
    agent: "support",
    message,
    history,
    toolData: {
      faq,
      matches
    }
  });
};

export const supportAgentStream = async (
  conversationId: string,
  message: string,
  history: Message[]
) => {
  const faq = await getFaqEntries();
  const matches = await searchFaq(message);

  return streamAgentText({
    agent: "support",
    message,
    history,
    toolData: {
      faq,
      matches
    }
  });
};
