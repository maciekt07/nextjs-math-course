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

    const results = await redis
      .multi()
      .zadd(key, { score: Date.now(), member: token })
      .expire(key, TTL_SECONDS)
      .zrange(key, 0, overflowEnd)
      .zremrangebyrank(key, 0, overflowEnd)
      .exec();

    const [, , removedTokens] = results as [
      unknown,
      unknown,
      string[], // zrange result
      unknown,
    ];

    if (removedTokens?.length) {
      await redis.del(...removedTokens);
    }
  } catch (error) {
    console.error("[limitUserSessions] session limit hook failed:", error);
  }
}
