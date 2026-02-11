import { Hono } from "hono";
import { prisma } from "../db/prisma";

const health = new Hono();

health.get("/", async (c) => {
  await prisma.$queryRaw`SELECT 1`;
  return c.json({ status: "ok", db: "connected" });
});

export default health;
