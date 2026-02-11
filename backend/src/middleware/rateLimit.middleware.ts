import { Context, Next } from "hono";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyGenerator?: (c: Context) => string;
};

type StoreEntry = { count: number; resetAt: number };

const defaultKeyGenerator = (c: Context) => {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
};

export const createRateLimiter = (options?: Partial<RateLimitOptions>) => {
  const windowMs = options?.windowMs ?? 60_000;
  const max = options?.max ?? 60;
  const keyGenerator = options?.keyGenerator ?? defaultKeyGenerator;

  const store = new Map<string, StoreEntry>();

  const middleware = async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", retryAfter.toString());
      return c.json(
        {
          error: "Too many requests",
          retryAfterSeconds: retryAfter
        },
        429
      );
    }

    entry.count += 1;
    store.set(key, entry);
    await next();
  };

  return {
    middleware,
    reset: () => store.clear()
  };
};

export const rateLimitMiddleware = createRateLimiter().middleware;
