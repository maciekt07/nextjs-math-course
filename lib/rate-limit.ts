// in-memory rate limiter for API routes (only works per server instance)

type RateLimitOptions = { windowMs: number; max: number };
type RateLimitRecord = { count: number; expiresAt: number };

const store = new Map<string, RateLimitRecord>();

export function rateLimit(options: RateLimitOptions) {
  return (key: string) => {
    // disable in dev

    // if (process.env.NODE_ENV === "development") {
    //   return { allowed: true, remaining: options.max };
    // }

    const now = Date.now();
    const record = store.get(key);

    if (!record || record.expiresAt < now) {
      store.set(key, { count: 1, expiresAt: now + options.windowMs });
      return { allowed: true, remaining: options.max - 1 };
    }

    if (record.count >= options.max)
      return { allowed: false, retryAfter: record.expiresAt - now };

    record.count += 1;
    store.set(key, record);
    return { allowed: true, remaining: options.max - record.count };
  };
}
