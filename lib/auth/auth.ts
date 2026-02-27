import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailHarmony } from "better-auth-harmony";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import { serverEnv } from "@/env/server";
import { AUTH_LIMITS } from "@/lib/constants/limits";
import { redis } from "@/lib/redis";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),

  plugins: [emailHarmony(), nextCookies()],

  trustedOrigins: [serverEnv.NGROK_URL, "http://localhost:3000"].filter(
    (o): o is string => Boolean(o),
  ),

  emailVerification: {
    sendVerificationEmail: async ({ url, user }) => {
      await sendEmail(url, user);
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    minPasswordLength: AUTH_LIMITS.passwordMin,
    maxPasswordLength: AUTH_LIMITS.passwordMax,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  rateLimit: {
    storage: "secondary-storage",
    // enable in dev
    // enabled: true,
    window: 10,
    max: 100,
  },

  secondaryStorage: {
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
  },

  databaseHooks: {
    session: {
      // prevents account sharing by limiting how many active sessions a user can have at the same time
      // if the limit is exceeded, the oldest sessions are automatically revoked
      create: {
        after: async (session) => {
          // if (process.env.NODE_ENV === "development") return;

          try {
            const key = `user:sessions:${session.userId}`;
            const now = Date.now();
            const limit = AUTH_LIMITS.maxSessions;
            const TTL = 30 * 24 * 60 * 60; // 30 days

            const pipeline = redis.multi();

            pipeline.zadd(key, { score: now, member: session.token });
            pipeline.expire(key, TTL);
            pipeline.zrange(key, 0, -limit - 1);
            pipeline.zremrangebyrank(key, 0, -limit - 1);

            const [, , removedTokens] = (await pipeline.exec()) as [
              unknown,
              unknown,
              string[],
              unknown,
            ];

            if (removedTokens?.length) {
              await redis.del(...removedTokens);
            }
          } catch (err) {
            console.error(
              "[session.create] Redis session limit hook failed:",
              err,
            );
          }
        },
      },
    },
  },
});
