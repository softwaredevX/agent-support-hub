export type AgentType =
  | "router"
  | "support"
  | "order"
  | "billing";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
}
