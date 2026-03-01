import "server-only";

import { AUTH_LIMITS } from "@lib/constants/limits";
import type { Session } from "better-auth";
import { redis } from "@/lib/redis";

const TTL_SECONDS = 30 * 24 * 60 * 60;

// prevents account sharing by limiting how many active sessions a user can have at the same time
// if the limit is exceeded, the oldest sessions are automatically revoked
// https://github.com/better-auth/better-auth/discussions/6134#discussioncomment-15030709
export async function limitUserSessions({
  userId,
  token,
}: Session): Promise<void> {
  if (process.env.NODE_ENV === "development") return;

  try {
    const key = `user:sessions:${userId}`;
    const limit = AUTH_LIMITS.maxSessions;
    const overflowEnd = -limit - 1;

    const pipeline = redis.pipeline();

    pipeline.zadd(key, { score: Date.now(), member: token });
    pipeline.expire(key, TTL_SECONDS);
    pipeline.zrange(key, 0, overflowEnd);
    pipeline.zremrangebyrank(key, 0, overflowEnd);

    const results = await pipeline.exec<[number, number, string[], number]>();
    const removedTokens = results[2];

    if (removedTokens && removedTokens.length > 0) {
      await redis.del(...removedTokens);
    }
  } catch (error) {
    console.error("[limitUserSessions] session limit hook failed:", error);
  }
}
