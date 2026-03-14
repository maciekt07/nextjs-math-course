import type { BetterAuthRateLimitOptions } from "better-auth";

// https://better-auth.com/docs/concepts/rate-limit

export const rateLimit: BetterAuthRateLimitOptions = {
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
      window: 30 * 60,
      max: 3,
    },
    "/reset-password": {
      window: 30 * 60,
      max: 3,
    },
    "/update-user": {
      window: 30 * 60,
      max: 3,
    },
    "/change-email": {
      window: 30 * 60,
      max: 3,
    },
  },
};
