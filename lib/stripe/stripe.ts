import Stripe from "stripe";
import { serverEnv } from "@/env/server";

export const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});
