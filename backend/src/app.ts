// src/app.ts
import { Hono } from "hono";
import chat from "./routes/chat.routes";
import agent from "./routes/agent.routes";
import health from "./routes/health.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { rateLimitMiddleware } from "./middleware/rateLimit.middleware";

export const app = new Hono();

app.use("*", rateLimitMiddleware);
app.use("*", errorMiddleware);

app.route("/api/chat", chat);
app.route("/api/agents", agent);
app.route("/api/health", health);
