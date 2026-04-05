import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const durationRegex = /^\d+(s|m|h|d|w)$/;

export const clientEnv = createEnv({
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PK: z
      .string()
      .min(10)
      .refine((val) => val.startsWith("pk"), {
        message: "Stripe public key must start with 'pk'",
      }),

    NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION: z
      .string()
      .regex(durationRegex)
      .default("2m"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK!,

    NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION:
      process.env.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION!,
  },
});

// export type ClientEnv = typeof clientEnv;
