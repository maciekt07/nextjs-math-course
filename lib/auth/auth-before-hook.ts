import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import type { User } from "better-auth/types";
import { passwordSchema, signUpSchema } from "@/lib/auth/auth-validation";

const PATHS = {
  SIGN_UP: "/sign-up/email",
  RESET_PASSWORD: "/reset-password",
  CHANGE_PASSWORD: "/change-password",
  REQUEST_PASSWORD_RESET: "/request-password-reset",
  UPDATE_USER: "/update-user",
  CHANGE_EMAIL: "/change-email",
} as const satisfies Record<string, string>;

type AuthPath = (typeof PATHS)[keyof typeof PATHS];

const PATH_RULES: Record<string, ReadonlySet<AuthPath>> = {
  password: new Set<AuthPath>([
    PATHS.SIGN_UP,
    PATHS.RESET_PASSWORD,
    PATHS.CHANGE_PASSWORD,
  ]),
  name: new Set<AuthPath>([PATHS.UPDATE_USER]),
  emailVerified: new Set<AuthPath>([
    PATHS.RESET_PASSWORD,
    PATHS.CHANGE_PASSWORD,
    PATHS.REQUEST_PASSWORD_RESET,
    PATHS.UPDATE_USER,
    PATHS.CHANGE_EMAIL,
  ]),
};

const AUTH_PATH_SET = new Set(Object.values(PATHS));

function isAuthPath(path: string): path is AuthPath {
  return AUTH_PATH_SET.has(path as AuthPath);
}

type CTX = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];

const validators = {
  password(ctx: CTX) {
    const password = ctx.body.password ?? ctx.body.newPassword;
    if (!passwordSchema.safeParse(password).success) {
      throw new APIError("BAD_REQUEST", {
        message: "Password not strong enough",
      });
    }
  },

  name(ctx: CTX) {
    if (!signUpSchema.shape.name.safeParse(ctx.body.name).success) {
      throw new APIError("BAD_REQUEST", { message: "Invalid name" });
    }
  },

  async emailVerified(ctx: CTX) {
    const session = await getSessionFromCtx(ctx);
    const email = session?.user?.email ?? ctx.body?.email;
    if (!email) return;

    const user = (await ctx.context.adapter.findOne({
      model: "user",
      where: [{ field: "email", value: email }],
    })) as User | null;

    if (user && !user.emailVerified) {
      throw new APIError("FORBIDDEN", {
        message: "Please verify your email before performing this action",
      });
    }
  },
};

export const authBeforeHook = createAuthMiddleware(async (ctx) => {
  if (!isAuthPath(ctx.path)) return;

  const checks = Object.entries(PATH_RULES) as [
    keyof typeof validators,
    ReadonlySet<AuthPath>,
  ][];

  for (const [rule, paths] of checks) {
    if (paths.has(ctx.path)) {
      await validators[rule](ctx);
    }
  }
});
