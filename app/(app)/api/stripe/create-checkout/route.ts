import { Ratelimit } from "@upstash/ratelimit";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { redis } from "@/lib/redis";
import { createPaymentIntent } from "@/lib/stripe/actions";

export const runtime = "nodejs";

const limiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "180 s"),
  analytics: true,
  prefix: "payment_intent_ratelimit",
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const { courseId } = body as { courseId?: string };

    if (!courseId || typeof courseId !== "string" || !courseId.trim()) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const { success, limit, reset, remaining } = await limiter.limit(userId);
    const rateLimitHeaders = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(reset / 1000).toString(),
    };

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Too many payment attempts, try again in ${retryAfter} seconds`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            ...rateLimitHeaders,
          },
        },
      );
    }

    const existingEnrollment = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, userId),
          eq(enrollment.courseId, courseId),
          eq(enrollment.status, "completed"),
        ),
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        { error: "You already have access to this course" },
        { status: 409, headers: rateLimitHeaders },
      );
    }

    const payload = await getPayloadClient();
    const course = await payload.findByID({
      id: courseId,
      collection: "courses",
      select: { title: true, description: true, price: true, slug: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404, headers: rateLimitHeaders },
      );
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: "This course is not available for purchase" },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    const result = await createPaymentIntent(course, session.user);

    return NextResponse.json(result, { headers: rateLimitHeaders });
  } catch (e: unknown) {
    console.error("Payment intent creation failed:", e);

    const errorMessage =
      e instanceof Error ? e.message : "Failed to create payment intent";

    const statusCode = errorMessage.includes("already have access") ? 409 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
