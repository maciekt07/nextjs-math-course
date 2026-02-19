import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import { serverEnv } from "@/env/server";
import { AUTH_LIMITS } from "@/lib/constants/limits";
import { redis } from "@/lib/redis";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),

  plugins: [nextCookies()],

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
    // enabled: true,
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
});
