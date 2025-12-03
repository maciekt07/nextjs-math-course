import { randomUUID } from "node:crypto";
import type { User } from "better-auth";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import type { Course } from "@/payload-types";
import { stripe } from "./stripe";

/**
 * Create a Stripe checkout session and a pending enrollment row in Postgres.
 * returns the checkout URL for the client to redirect to.
 */
export async function createPaymentIntent(
  course: Pick<Course, "title" | "description" | "id" | "price" | "slug">,
  user: User,
) {
  const price = Math.round((course.price || 0) * 100); // cents

  const successBase =
    process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer: customer.id,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description || undefined,
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      courseId: course.id,
    },
    success_url: `${successBase}/course/${(course.slug as string) || ""}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${successBase}/course/${(course.slug as string) || ""}`,
  });

  const id = randomUUID();

  await db.insert(enrollment).values({
    id,
    userId: user.id,
    courseId: course.id,
    stripePaymentIntentId: (session.payment_intent as string) || session.id,
    stripeCustomerId: customer.id,
    amount: String(course.price ?? 0),
    currency: "usd",
    status: "pending",
  });

  return { url: session.url };
}

/**
 * Helper to update an enrollment's metadata when we learn of the payment intent.
 * Used by webhook or other reconciliation flows.
 */
export async function updatePaymentMetadata(
  paymentIntentId: string,
  updated: InferSelectModel<typeof enrollment>,
) {
  await db
    .update(enrollment)
    .set({
      stripeCustomerId: updated.stripeCustomerId ?? undefined,
      amount: updated.amount ?? undefined,
      currency: updated.currency ?? undefined,
    })
    .where(eq(enrollment.stripePaymentIntentId, paymentIntentId));
}
