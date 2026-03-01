import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailHarmony } from "better-auth-harmony";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import { serverEnv } from "@/env/server";
import { secondaryStorage } from "@/lib/auth/secondary-storage";
import { limitUserSessions } from "@/lib/auth/session-limit";
import { AUTH_LIMITS } from "@/lib/constants/limits";

// https://www.better-auth.com/docs/reference/options
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

  secondaryStorage,

  databaseHooks: {
    session: {
      create: {
        after: limitUserSessions,
      },
    },
  },
});
