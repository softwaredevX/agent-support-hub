// src/routes/agent.routes.ts
import { Hono } from "hono";

const agent = new Hono();

const agents = [
  {
    type: "support",
    description: "General support, FAQs, troubleshooting",
    tools: ["conversation-history", "faq-search"]
  },
  {
    type: "order",
    description: "Order status, tracking, modifications, cancellations",
    tools: ["order-details", "delivery-status", "conversation-history"]
  },
  {
    type: "billing",
    description: "Payments, refunds, invoices, subscriptions",
    tools: ["invoice-details", "refund-status", "conversation-history"]
  }
];

agent.get("/", c => c.json(agents.map(({ type, description }) => ({ type, description }))));

agent.get("/:type/capabilities", c => {
  const match = agents.find(item => item.type === c.req.param("type"));
  if (!match) return c.json({ error: "Agent not found" }, 404);
  return c.json({ type: match.type, tools: match.tools });
});

export default agent;
