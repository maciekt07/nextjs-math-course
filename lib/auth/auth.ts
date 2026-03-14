import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailHarmony } from "better-auth-harmony";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import ChangeEmailEmailTemplate from "@/email/templates/change-email-template";
import ResetPasswordEmailTemplate from "@/email/templates/reset-password-template";
import VerificationEmailTemplate from "@/email/templates/verification-template";
import { serverEnv } from "@/env/server";
import { authBeforeHook } from "@/lib/auth/auth-before-hook";
import { rateLimit } from "@/lib/auth/auth-rate-limit";
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

    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        subject: "Verify Your Email",
        react: VerificationEmailTemplate({ name: user.name, url }),
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: AUTH_LIMITS.passwordMin,
    maxPasswordLength: AUTH_LIMITS.passwordMax,
    resetPasswordTokenExpiresIn: AUTH_LIMITS.resetPasswordTokenTTL,
    async sendResetPassword({ user, url }) {
      void sendEmail({
        subject: "Reset your password",
        react: ResetPasswordEmailTemplate({ name: user.name, url }),
      });
    },
  },

  user: {
    changeEmail: {
      enabled: true,

      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void sendEmail({
          subject: "Approve email change",
          react: ChangeEmailEmailTemplate({ name: user.name, newEmail, url }),
        });
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 3, // 3 minutes
    },
  },

  rateLimit,

  secondaryStorage,

  hooks: {
    before: authBeforeHook,
  },

  databaseHooks: {
    session: {
      create: {
        after: limitUserSessions,
      },
    },
  },
});
