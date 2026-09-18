import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const S3EnvSchema = {
  bucket: z.string().min(1).optional(),
  accessKeyId: z.string().min(1).optional(),
  secret: z.string().min(1).optional(),
  endpoint: z.string().url().optional(),
};

const secretSchema = z
  .string()
  .min(32, "Secret must be at least 32 characters long");

export const serverEnv = createEnv({
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
  emptyStringAsUndefined: true,
  server: {
    NGROK_URL: z.string().url().optional(),

    DATABASE_URL: z
      .string()
      .url()
      .refine((val) => val.startsWith("postgresql://"), {
        message: "DATABASE_URL must start with 'postgresql://'",
      }),

    BETTER_AUTH_SECRET: secretSchema,
    BETTER_AUTH_URL: z.string().url(),

    RESEND_API_KEY: z
      .string()
      .min(1)
      .refine((val) => val.startsWith("re"), {
        message: "RESEND_API_KEY must start with 're'",
      }),

    RESEND_FROM_EMAIL: z
      .string()
      .email("RESEND_FROM_EMAIL must be a valid email address"),

    PAYLOAD_SECRET: secretSchema,
    CRON_SECRET: secretSchema,

    PAYLOAD_DEV_AUTOLOGIN_EMAIL: z.string().email().optional(),
    PAYLOAD_DEV_AUTOLOGIN_PASSWORD: z.string().min(6).optional(),

    MONGO_URL: z
      .string()
      .refine(
        (val) =>
          val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
        {
          message: "MONGO_URL must start with 'mongodb://' or 'mongodb+srv://'",
        },
      ),

    QSTASH_URL: z.string().url(),
    QSTASH_TOKEN: z.string().min(1),
    // verifySignatureAppRouter
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1),

    ENABLE_S3: z.enum(["true", "false"]).transform((v) => v === "true"),

    S3_ENDPOINT: S3EnvSchema.endpoint,
    S3_BUCKET: S3EnvSchema.bucket,
    S3_ACCESS_KEY_ID: S3EnvSchema.accessKeyId,
    S3_SECRET: S3EnvSchema.secret,

    S3_PUBLIC_CDN_URL: z.string().url().optional(),
    S3_PUBLIC_ENDPOINT: S3EnvSchema.endpoint,
    S3_PUBLIC_BUCKET: S3EnvSchema.bucket,
    S3_PUBLIC_ACCESS_KEY_ID: S3EnvSchema.accessKeyId,
    S3_PUBLIC_SECRET: S3EnvSchema.secret,

    MUX_TOKEN_ID: z.string().min(1),
    MUX_TOKEN_SECRET: z.string().min(1),
    MUX_WEBHOOK_SIGNING_SECRET: z.string().min(1),
    MUX_JWT_KEY_ID: z.string().min(1),
    MUX_JWT_KEY: z.string().min(1),

    STRIPE_SECRET_KEY: z
      .string()
      .min(10)
      .refine((val) => val.startsWith("sk"), {
        message: "STRIPE_SECRET_KEY must start with 'sk'",
      }),

    STRIPE_WEBHOOK_SECRET: z
      .string()
      .min(10)
      .refine((val) => val.startsWith("whsec"), {
        message: "STRIPE_WEBHOOK_SECRET must start with 'whsec'",
      }),

    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },

  createFinalSchema: (shape) =>
    z.object(shape).superRefine((env, ctx) => {
      if (!env.ENABLE_S3) return;

      const requiredS3Keys = [
        "S3_BUCKET",
        "S3_ACCESS_KEY_ID",
        "S3_SECRET",
        "S3_PUBLIC_BUCKET",
        "S3_PUBLIC_ACCESS_KEY_ID",
        "S3_PUBLIC_SECRET",
      ] as const satisfies readonly (keyof typeof shape)[];

      for (const key of requiredS3Keys) {
        if (!env[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when ENABLE_S3 is true`,
          });
        }
      }
    }),

  experimental__runtimeEnv: process.env,
});

// export type ServerEnv = typeof serverEnv;
