import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const S3EnvSchema = {
  bucket: z.string().min(1).optional(),
  accessKeyId: z.string().min(1).optional(),
  secret: z.string().min(1).optional(),
  endpoint: z.string().url().optional().or(z.literal("")),
};

export const serverEnv = createEnv({
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
  server: {
    NGROK_URL: z.string().url().optional().or(z.literal("")),
    DATABASE_URL: z
      .string()
      .url()
      .min(10)
      .refine((val) => val.startsWith("postgresql://"), {
        message: "DATABASE_URL must start with 'postgresql://'",
      }),
    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_NAME: z.string().optional(),

    BETTER_AUTH_SECRET: z.string().min(16),
    BETTER_AUTH_URL: z.string().url().min(1),

    RESEND_API_KEY: z
      .string()
      .min(1)
      .refine((val) => val.startsWith("re"), {
        message: "RESEND_API_KEY must start with 're'",
      }),
    RESEND_FROM_EMAIL: z
      .string()
      .email("RESEND_FROM_EMAIL must be a valid email address"),

    PAYLOAD_SECRET: z.string().min(16),
    MONGO_URL: z
      .string()
      .min(1)
      .refine(
        (val) =>
          val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
        {
          message: "MONGO_URL must start with 'mongodb://' or 'mongodb+srv://'",
        },
      ),

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
  experimental__runtimeEnv: {},
});

// export type ServerEnv = typeof serverEnv;
