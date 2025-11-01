import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/drizzle/db";
import { enrollment, user } from "@/drizzle/schema";
import { stripe } from "@/lib/stripe/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
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
    return NextResponse.json(
      { error: `Webhook error: ${message}` },
      { status: 400 },
    );
  }

  // handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const paymentIntentId = String(session.payment_intent || session.id);
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;

    try {
      // find by payment intent id first
      const found = await db
        .select()
        .from(enrollment)
        .where(eq(enrollment.stripePaymentIntentId, paymentIntentId));

      if (found && found.length > 0) {
        await db
          .update(enrollment)
          .set({
            status: "completed",
            stripeCustomerId: session.customer as string,
          })
          .where(eq(enrollment.stripePaymentIntentId, paymentIntentId));
      } else if (userId && courseId) {
        // fallback: match by userId + courseId
        await db
          .update(enrollment)
          .set({
            status: "completed",
            stripePaymentIntentId: paymentIntentId,
            stripeCustomerId: session.customer as string,
          })
          .where(
            and(
              eq(enrollment.userId, userId),
              eq(enrollment.courseId, courseId),
            ),
          );
        // persist stripe customer id on the user record
        try {
          const stripeCustomer = session.customer as string;
          const uid = found[0].userId;
          if (uid && stripeCustomer) {
            await db
              .update(user)
              .set({ stripeCustomerId: stripeCustomer })
              .where(eq(user.id, uid));
          }
        } catch (e) {
          console.error("Failed to update user with stripeCustomerId:", e);
        }
      }
    } catch (e) {
      console.error("Failed to update enrollment after webhook:", e);
    }
  }

  return NextResponse.json({ received: true });
}
