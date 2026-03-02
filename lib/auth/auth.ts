import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailHarmony } from "better-auth-harmony";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import { serverEnv } from "@/env/server";
import { passwordSchema } from "@/lib/auth/auth-validation";
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
    expiresIn: AUTH_LIMITS.verificationTokenTTL,
    sendOnSignUp: false,
    sendVerificationEmail: async ({ url, user }) => {
      await sendEmail(url, user);
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: AUTH_LIMITS.passwordMin,
    maxPasswordLength: AUTH_LIMITS.passwordMax,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 3, // 3 minutes
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

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body.password || ctx.body.newPassword;
        const { error } = passwordSchema.safeParse(password);
        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: "Password not strong enough",
          });
        }
      }
    }),
  },

  databaseHooks: {
    session: {
      create: {
        after: limitUserSessions,
      },
    },
  },
});
