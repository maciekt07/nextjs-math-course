import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { serverEnv } from "@/env/server";
import { stripe } from "@/lib/stripe/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;
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
      let updated = false;

      const existing = await db
        .select()
        .from(enrollment)
        .where(eq(enrollment.stripePaymentIntentId, paymentIntentId));

      if (existing.length > 0) {
        await db
          .update(enrollment)
          .set({
            status: "completed",
            stripeCustomerId: session.customer as string,
          })
          .where(eq(enrollment.stripePaymentIntentId, paymentIntentId));

        updated = true;
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

        if (fallback.length > 0) {
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

          updated = true;
        }
      }

      if (updated && userId && courseId) {
        revalidateTag(`enrollment:${userId}:${courseId}`);
        revalidateTag(`enrollments:${userId}`);
      }
    } catch (error) {
      console.error("Failed to update enrollment after webhook:", error);
    }
  }

  return NextResponse.json({ received: true });
}
