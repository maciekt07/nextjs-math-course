import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  const { payment_status, metadata, customer, id: sessionId } = session;

  if (payment_status !== "paid") {
    console.log(
      `Checkout session ${sessionId} not paid yet: ${payment_status}`,
    );
    return;
  }

  const userId = metadata?.userId;
  const courseId = metadata?.courseId;
  const courseSlug = metadata?.courseSlug;
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

    try {
      await db
        .insert(enrollment)
        .values({
          id: enrollmentId,
          userId,
          courseId,
          stripePaymentIntentId:
            (session.payment_intent as string) || sessionId,
          stripeCustomerId: customer as string,
          amount: amount || "0",
          currency: "usd",
          status: "completed",
          createdAt: new Date(),
        })
        .onConflictDoNothing({ target: enrollment.stripePaymentIntentId });
    } catch (e) {
      console.log(`Failed to insert enrollment, likely exists:`, e);
    }
  }

  revalidateTag(`enrollment:${userId}:${courseId}`, "max");
  revalidateTag(`enrollments:${userId}`, "max");

  if (courseSlug) {
    revalidateTag(`course-slug:${courseSlug}`, "max");
  }
}
