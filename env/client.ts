import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const durationRegex = /^\d+(s|m|h|d|w)$/;

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
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
    NEXT_PUBLIC_MUX_PUBLIC_EXPIRATION: z
      .string()
      .regex(durationRegex)
      .default("7d"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
    NEXT_PUBLIC_STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK!,

    NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION:
      process.env.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION!,
    NEXT_PUBLIC_MUX_PUBLIC_EXPIRATION:
      process.env.NEXT_PUBLIC_MUX_PUBLIC_EXPIRATION!,
  },
});

export type ClientEnv = typeof clientEnv;
