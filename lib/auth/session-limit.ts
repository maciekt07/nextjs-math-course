import "server-only";

import type { Session } from "better-auth";
import { LIMITS } from "@/lib/constants/limits";
import { redis } from "@/lib/redis";

// https://redis.io/docs/latest/develop/programmability/lua-api/

// KEYS[1] - user:sessions:{userId} sorted set
// ARGV[1] - token
// ARGV[2] - score timestamp ms
// ARGV[3] - max sessions limit
// ARGV[4] - TTL seconds

const LIMIT_SESSIONS_LUA_SCRIPT = `
local key = KEYS[1]
local token = ARGV[1]
local score = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

redis.call('ZADD', key, score, token)
redis.call('EXPIRE', key, ttl)

local size = redis.call('ZCARD', key)
local excess = size - limit
if excess > 0 then
  local removed = redis.call('ZRANGE', key, 0, excess - 1)
  redis.call('ZREMRANGEBYRANK', key, 0, excess - 1)
  for _, t in ipairs(removed) do
    redis.call('DEL', t)
  end
end
`;

/**
 * prevents account sharing by limiting how many active sessions a user can have at the same time
 * if the limit is exceeded, the oldest sessions are automatically revoked
 * @see https://github.com/better-auth/better-auth/discussions/6134#discussioncomment-15030709
 */
export async function limitUserSessions({
  userId,
  token,
}: Session): Promise<void> {
  // disable in dev
  if (process.env.NODE_ENV === "development") return;

  try {
    const key = `user:sessions:${userId}`;

    await redis.eval(
      LIMIT_SESSIONS_LUA_SCRIPT,
      [key],
      [
        token,
        Date.now().toString(),
        LIMITS.auth.maxSessions.toString(),
        LIMITS.auth.sessionExpiresIn.toString(),
      ],
    );
  } catch (error) {
    console.error("[limitUserSessions] session limit hook failed:", error);
  }
}
