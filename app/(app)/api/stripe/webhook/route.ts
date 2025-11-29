import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
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
      const existing = await db
        .select()
        .from(enrollment)
        .where(eq(enrollment.stripePaymentIntentId, paymentIntentId));

      if (existing && existing.length > 0) {
        // already exists update status
        await db
          .update(enrollment)
          .set({
            status: "completed",
            stripeCustomerId: session.customer as string,
          })
          .where(eq(enrollment.stripePaymentIntentId, paymentIntentId));
      } else if (userId && courseId) {
        // fallback by userId + courseId
        const fallback = await db
          .select()
          .from(enrollment)
          .where(
            and(
              eq(enrollment.userId, userId),
              eq(enrollment.courseId, courseId),
            ),
          );

        if (fallback && fallback.length > 0) {
          await db
            .update(enrollment)
            .set({
              status: "completed",
              stripeCustomerId: session.customer as string,
            })
            .where(
              and(
                eq(enrollment.userId, userId),
                eq(enrollment.courseId, courseId),
              ),
            );
        } else {
          console.warn("No enrollment found for webhook fallback", {
            userId,
            courseId,
          });
        }
      }
    } catch (e) {
      console.error("Failed to update enrollment after webhook:", e);
    }
  }

  return NextResponse.json({ received: true });
}
