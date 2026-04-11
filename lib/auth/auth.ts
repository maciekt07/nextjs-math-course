import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, oneTap } from "better-auth/plugins";
import { emailHarmony } from "better-auth-harmony";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import ChangeEmailEmailTemplate from "@/email/templates/change-email-template";
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
import { AUTH_LIMITS } from "@/lib/constants/limits";

// https://www.better-auth.com/docs/reference/options
export const auth = betterAuth({
  appName: "Math Course",

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
    expiresIn: AUTH_LIMITS.verificationTokenTTL,
    sendOnSignUp: false,

    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Confirm Your Email Address - Math Course Online",
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
        to: user.email,
        subject: "Reset Your Password - Math Course Online",
        react: ResetPasswordEmailTemplate({ name: user.name, url }),
      });
    },
  },

  user: {
    changeEmail: {
      enabled: true,

      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void sendEmail({
          to: user.email,
          subject: "Please Confirm Your New Email Address - Math Course Online",
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
    expiresIn: AUTH_LIMITS.sessionExpiresIn,
    cookieCache: {
      enabled: true,
      maxAge: AUTH_LIMITS.cookieCacheMaxAge,
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
