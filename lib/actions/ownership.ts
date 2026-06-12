"use server";

import { getServerSession } from "@/lib/auth/get-session";
import { getOwnedCourseIds } from "@/lib/data/courses";
import { stripe } from "@/lib/stripe/stripe";

export async function getOwnedCourseIdsAction() {
  const session = await getServerSession();
  if (!session?.user?.id) return [];
  return getOwnedCourseIds(session.user.id);
}

export async function confirmCheckoutOwnershipAction(
  courseId: string,
  checkoutSessionId: string,
) {
  const session = await getServerSession();
  if (!session?.user?.id || !checkoutSessionId) return false;

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
