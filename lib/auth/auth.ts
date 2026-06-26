import "server-only";

import { waitUntil } from "@vercel/functions";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, oneTap } from "better-auth/plugins";
import { emailHarmony } from "better-auth-harmony";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import AccountReadyEmailTemplate from "@/email/templates/account-ready-template";
import ChangeEmailEmailTemplate from "@/email/templates/change-email-template";
import DeleteAccountEmailTemplate from "@/email/templates/delete-account-template";
import ResetPasswordEmailTemplate from "@/email/templates/reset-password-template";
import VerificationEmailTemplate from "@/email/templates/verification-template";
import { clientEnv } from "@/env/client";
import { serverEnv } from "@/env/server";
import { authBeforeHook } from "@/lib/auth/auth-before-hook";
import { rateLimit } from "@/lib/auth/auth-rate-limit";
import {
  GOOGLE_ONE_TAP_PATH,
  handleGoogleOneTapUser,
} from "@/lib/auth/google-profile";
import { secondaryStorage } from "@/lib/auth/secondary-storage";
import { limitUserSessions } from "@/lib/auth/session-limit";
import { LIMITS } from "@/lib/constants/limits";
import { APP_NAME, APP_SHORT_NAME } from "@/lib/constants/site";

// https://www.better-auth.com/docs/reference/options
export const auth = betterAuth({
  appName: APP_SHORT_NAME,

  database: drizzleAdapter(db, { provider: "pg" }),

  socialProviders: {
    google: {
      clientId: clientEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          name: profile.given_name,
          image: undefined,
        };
      },
    },
  },

  onAPIError: {
    errorURL: "/auth/error",
  },

  advanced: {
    // https://better-auth.com/docs/guides/optimizing-for-performance#background-tasks
    backgroundTasks: { handler: waitUntil },
  },

  plugins: [
    emailHarmony(),
    lastLoginMethod({
      customResolveMethod: (ctx) => {
        if (ctx.path === GOOGLE_ONE_TAP_PATH) {
          return "google";
        }
        // default resolution
        return null;
      },
    }),
    oneTap(),
    nextCookies(),
  ],

  trustedOrigins: [serverEnv.NGROK_URL, "http://localhost:3000"].filter(
    (o): o is string => Boolean(o),
  ),

  emailVerification: {
    expiresIn: LIMITS.auth.verificationTokenTTL,
    sendOnSignUp: false,

    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: `Confirm Your Email Address - ${APP_NAME}`,
        react: VerificationEmailTemplate({ name: user.name, url }),
      });
    },

    afterEmailVerification: async (user) => {
      void sendEmail({
        to: user.email,
        subject: `Your ${APP_NAME} Account Is Ready`,
        react: AccountReadyEmailTemplate({ name: user.name }),
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: LIMITS.auth.passwordMinLength,
    maxPasswordLength: LIMITS.auth.passwordMaxLength,
    resetPasswordTokenExpiresIn: LIMITS.auth.resetPasswordTokenTTL,
    async sendResetPassword({ user, url }) {
      void sendEmail({
        to: user.email,
        subject: `Reset Your Password - ${APP_NAME}`,
        react: ResetPasswordEmailTemplate({ name: user.name, url }),
      });
    },
  },

  user: {
    deleteUser: {
      enabled: true,
      deleteTokenExpiresIn: LIMITS.auth.deleteTokenTTL,
      sendDeleteAccountVerification: async ({ user, url }) => {
        void sendEmail({
          to: user.email,
          subject: `Confirm Account Deletion - ${APP_NAME}`,
          react: DeleteAccountEmailTemplate({ name: user.name, url }),
        });
      },
    },

    changeEmail: {
      enabled: true,
      // shares same TTL as emailVerification.expiresIn (LIMITS.auth.verificationTokenTTL)
      // https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/api/routes/update-user.ts
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void sendEmail({
          to: user.email,
          subject: `Please Confirm Your New Email Address - ${APP_NAME}`,
          react: ChangeEmailEmailTemplate({ name: user.name, newEmail, url }),
        });
      },
    },
  },

  account: {
    accountLinking: {
      enabled: false,
    },
  },

  session: {
    expiresIn: LIMITS.auth.sessionExpiresIn,
    cookieCache: {
      enabled: true,
      maxAge: LIMITS.auth.cookieCacheMaxAge,
    },
  },

  rateLimit,

  secondaryStorage,

  hooks: {
    before: authBeforeHook,
  },

  databaseHooks: {
    user: {
      create: { before: handleGoogleOneTapUser },
      update: { before: handleGoogleOneTapUser },
    },
    session: {
      create: {
        after: limitUserSessions,
      },
    },
  },
});
