import { Context, Next } from "hono";
import { ZodError } from "zod";

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err: any) {
    if (err instanceof ZodError) {
      return c.json({ error: "Invalid request", details: err.flatten() }, 400);
    }
    return c.json(
      { error: err.message || "Internal Server Error" },
      500
    );
  }
};
