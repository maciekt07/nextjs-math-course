"use server";

import { Ratelimit } from "@upstash/ratelimit";
import { getServerSession } from "@/lib/auth/get-session";
import { getOwnedCourseIds } from "@/lib/data/courses";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe/stripe";

export async function getOwnedCourseIdsAction() {
  const session = await getServerSession();
  if (!session?.user?.id) return [];
  return getOwnedCourseIds(session.user.id);
}

const checkoutConfirmLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix: "checkout_confirm_ratelimit",
  analytics: true,
});

export async function confirmCheckoutOwnershipAction(
  courseId: string,
  checkoutSessionId: string,
) {
  const session = await getServerSession();
  if (!session?.user?.id || !checkoutSessionId) return false;
  const { success } = await checkoutConfirmLimiter.limit(session.user.id);
  if (!success) return false;

  try {
    const checkoutSession =
      await stripe.checkout.sessions.retrieve(checkoutSessionId);

    return (
      checkoutSession.payment_status === "paid" &&
      checkoutSession.metadata?.courseId === courseId &&
      checkoutSession.metadata?.userId === session.user.id
    );
  } catch {
    return false;
  }
}
