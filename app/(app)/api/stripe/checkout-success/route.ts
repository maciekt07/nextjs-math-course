import { NextResponse } from "next/server";
import { handleCheckoutCompleted } from "@/lib/stripe/handle-checkout";
import { stripe } from "@/lib/stripe/stripe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session && session.payment_status === "paid") {
      await handleCheckoutCompleted(session);

      const courseSlug = session.metadata?.courseSlug;
      if (courseSlug) {
        return NextResponse.redirect(
          new URL(`/course/${courseSlug}`, request.url),
        );
      }
    }
  } catch (error) {
    console.error("Error processing checkout success:", error);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
