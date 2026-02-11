import type { ChatAgentType } from "../utils/intentClassifier";

export interface Message {
    id: string;
    role: "user" | "agent";
    content: string;
    agentType?: ChatAgentType;
    status?: "sending" | "streaming" | "complete" | "error";
  }
  
