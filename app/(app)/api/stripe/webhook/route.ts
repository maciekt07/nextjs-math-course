import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { serverEnv } from "@/env/server";
import { handleCheckoutCompleted } from "@/lib/stripe/handle-checkout";
import { stripe } from "@/lib/stripe/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature") || "";
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret,
    ) as Stripe.Event;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook error: ${message}` },
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return NextResponse.json({
      received: true,
      error: "Processing failed but acknowledged",
    });
  }

  return NextResponse.json({ received: true });
}
