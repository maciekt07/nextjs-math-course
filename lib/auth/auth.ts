import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import { serverEnv } from "@/env/server";
import { AUTH_LIMITS } from "@/lib/constants/limits";

export const auth = betterAuth({
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
  plugins: [nextCookies()],
  trustedOrigins: [serverEnv.NGROK_URL].filter((o): o is string => Boolean(o)),
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
});
