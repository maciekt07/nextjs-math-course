import "server-only";

import type { SecondaryStorage } from "better-auth";
import { redis } from "@/lib/redis";

// https://www.better-auth.com/docs/concepts/database#secondary-storage

export const secondaryStorage: SecondaryStorage = {
  async get(key: string) {
    const val = await redis.get(key);
    if (val === null) return null;
    return typeof val === "string" ? val : JSON.stringify(val);
  },

  async set(key: string, value: unknown, ttl?: number) {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttl) {
      await redis.set(key, serialized, { ex: ttl });
    } else {
      await redis.set(key, serialized);
    }
  },

  async delete(key: string) {
    await redis.del(key);
  },
};
