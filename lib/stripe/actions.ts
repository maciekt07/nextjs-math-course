"use server";

import { Ratelimit } from "@upstash/ratelimit";
import type { User } from "better-auth";
import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { clientEnv } from "@/env/client";
import { redis } from "@/lib/redis";
import type { Course } from "@/types/payload-types";
import { stripe } from "./stripe";

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "180 s"),
  analytics: true,
  prefix: "checkout_ratelimit",
});

/**
 * Create a Stripe checkout session and a pending enrollment row in Postgres.
 * returns the checkout URL for the client to redirect to.
 */
export async function createPaymentIntent(
  course: Pick<Course, "title" | "description" | "id" | "price" | "slug">,
  user: User,
) {
  const { success, reset } = await limiter.limit(`user:${user.id}`);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw new Error(
      `Too many checkout attempts, try again in ${retryAfter} seconds`,
    );
  }

  const existingEnrollment = await db
    .select()
    .from(enrollment)
    .where(
      and(
        eq(enrollment.userId, user.id),
        eq(enrollment.courseId, course.id),
        eq(enrollment.status, "completed"),
      ),
    )
    .limit(1);

  if (existingEnrollment.length > 0) {
    throw new Error("You already have access to this course");
  }

  const price = Math.round((course.price || 0) * 100);
  const successBase = clientEnv.NEXT_PUBLIC_APP_URL;

  const existingCustomers = await stripe.customers.list({
    email: user.email,
    limit: 1,
  });

  const customer =
    existingCustomers.data[0] ||
    (await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer: customer.id,
    custom_text: {
      submit: {
        message: "Test card: 4242 4242 4242 4242 · Any future date · Any CVC",
      },
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description || undefined,
            metadata: {
              courseId: course.id,
            },
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: String(course.slug || ""),
      amount: String(course.price ?? 0),
    },
    success_url: `${successBase}/course/${course.slug}?payment_success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${successBase}/course/${(course.slug as string) || ""}?canceled=true`,
    // prevent duplicate checkouts
    client_reference_id: `${user.id}_${course.id}`,
    expires_at: Math.floor(Date.now() / 1000) + 1800,
  });

  return { url: session.url, sessionId: session.id };
}
