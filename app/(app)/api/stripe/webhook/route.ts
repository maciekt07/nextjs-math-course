import { randomUUID } from "node:crypto";
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { payment_status, metadata, customer, id: sessionId } = session;

  if (payment_status !== "paid") {
    console.log(
      `Checkout session ${sessionId} not paid yet: ${payment_status}`,
    );
    return;
  }

  const userId = metadata?.userId;
  const courseId = metadata?.courseId;
  const amount = metadata?.amount;

  if (!userId || !courseId) {
    console.error(`Missing metadata in session ${sessionId}:`, {
      userId,
      courseId,
    });
    return;
  }

  const existingEnrollment = await db
    .select()
    .from(enrollment)
    .where(
      and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId)),
    )
    .limit(1);

  if (existingEnrollment.length > 0) {
    console.log(
      `Enrollment already exists for user ${userId} and course ${courseId}`,
    );

    if (existingEnrollment[0].status !== "completed") {
      await db
        .update(enrollment)
        .set({
          status: "completed",
          stripeCustomerId: customer as string,
          stripePaymentIntentId: session.payment_intent as string,
        })
        .where(eq(enrollment.id, existingEnrollment[0].id));

      console.log(
        `Updated enrollment ${existingEnrollment[0].id} to completed`,
      );
    }
  } else {
    const enrollmentId = randomUUID();

    await db.insert(enrollment).values({
      id: enrollmentId,
      userId,
      courseId,
      stripePaymentIntentId: (session.payment_intent as string) || sessionId,
      stripeCustomerId: customer as string,
      amount: amount || "0",
      currency: "usd",
      status: "completed",
      createdAt: new Date(),
    });
  }

  // revalidate caches
  revalidateTag(`enrollment:${userId}:${courseId}`);
  revalidateTag(`enrollments:${userId}`);
}
