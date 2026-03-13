import "server-only";

import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailHarmony } from "better-auth-harmony";
import { db } from "@/drizzle/db";
import { sendEmail } from "@/email/send-email";
import ResetPasswordEmailTemplate from "@/email/templates/reset-password-template";
import VerificationEmailTemplate from "@/email/templates/verification-template";
import { serverEnv } from "@/env/server";
import { passwordSchema, signUpSchema } from "@/lib/auth/auth-validation";
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
    customRules: {
      "/send-verification-email": {
        window: 15 * 60,
        max: 4,
      },
      "/request-password-reset": {
        window: 20 * 60,
        max: 3,
      },
      "/reset-password": {
        window: 20 * 60,
        max: 3,
      },
      "/update-user": {
        window: 20 * 60,
        max: 3,
      },
    },
  },

  secondaryStorage,

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // vaildate password
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

      // validate name
      if (ctx.path === "/sign-up/email") {
        const { error } = signUpSchema.shape.name.safeParse(ctx.body.name);

        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid name.",
          });
        }
      }

      // block unverified users from changing password
      if (
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password" ||
        ctx.path === "/request-password-reset"
      ) {
        const session = ctx.context.session;
        const email = session?.user?.email ?? ctx.body?.email;

        if (email) {
          const user = (await ctx.context.adapter.findOne({
            model: "user",
            where: [{ field: "email", value: email }],
          })) as User;

          if (user && !user.emailVerified) {
            throw new APIError("FORBIDDEN", {
              message: "Please verify your email before performing this action",
            });
          }
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
