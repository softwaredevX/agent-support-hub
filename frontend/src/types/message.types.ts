export interface Message {
    id: string;
    role: "user" | "agent";
    content: string;
    agentType?: string;
    status?: "sending" | "streaming" | "complete" | "error";
  }
  