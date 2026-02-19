import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    NGROK_URL: z.url().optional().or(z.literal("")),
    DATABASE_URL: z
      .url()
      .min(10)
      .refine((val) => val.startsWith("postgresql://"), {
        message: "DATABASE_URL must start with 'postgresql://'",
      }),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_PASSWORD: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_NAME: z.string().min(1),

    BETTER_AUTH_SECRET: z.string().min(16),
    BETTER_AUTH_URL: z.url().min(1),

    RESEND_API_KEY: z
      .string()
      .min(1)
      .refine((val) => val.startsWith("re"), {
        message: "RESEND_API_KEY must start with 're'",
      }),

    PAYLOAD_SECRET: z.string().min(16),
    MONGO_URL: z
      .url()
      .min(1)
      .refine(
        (val) =>
          val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
        {
          message: "MONGO_URL must start with 'mongodb://' or 'mongodb+srv://'",
        },
      ),

    ENABLE_S3: z.coerce.boolean().default(false),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET: z.string().optional(),
    S3_ENDPOINT: z.url().optional().or(z.literal("")),

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

    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  },
  experimental__runtimeEnv: {},
});

export type ServerEnv = typeof serverEnv;
