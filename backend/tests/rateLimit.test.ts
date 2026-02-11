import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { createRateLimiter } from "../src/middleware/rateLimit.middleware";

describe("rate limit middleware", () => {
  it("blocks after max requests within window", async () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2 });
    const app = new Hono();
    app.use("*", limiter.middleware);
    app.get("/ping", (c) => c.text("ok"));

    const res1 = await app.request("/ping");
    const res2 = await app.request("/ping");
    const res3 = await app.request("/ping");

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(429);
  });
});
