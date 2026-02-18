import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { auth } from "@/lib/auth/auth";
import { FEEDBACK_LIMITS } from "@/lib/constants/limits";
import { getPayloadClient } from "@/lib/payload-client";
import { redis } from "@/lib/redis";

const limiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, "180 s"),
  analytics: true,
  prefix: "feedback_ratelimit",
});

const sanitize = (text: string) =>
  sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name: userName, id: userId, email: userEmail } = session.user;

    const { success, limit, reset, remaining } = await limiter.limit(userId);
    const rateLimitHeaders = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(reset / 1000).toString(),
    };

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many requests, try again later" },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            ...rateLimitHeaders,
          },
        },
      );
    }

    const body = await req.json();
    const { lessonId, reaction, comment = "" } = body;

    if (!lessonId || typeof lessonId !== "string" || !lessonId.trim())
      return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });

    if (typeof reaction !== "number" || !Number.isInteger(reaction))
      return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });

    if (reaction < 1 || reaction > 4) {
      return NextResponse.json(
        { error: "Reaction must be between 1 and 4" },
        { status: 400 },
      );
    }

    // validate comment
    if (comment && typeof comment !== "string") {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > FEEDBACK_LIMITS.comment) {
      return NextResponse.json(
        {
          error: `Comment is too long (${trimmedComment.length}/${FEEDBACK_LIMITS.comment})`,
        },
        { status: 400 },
      );
    }

    // sanitize comment
    const sanitizedComment = sanitize(trimmedComment);
    if (trimmedComment && !sanitizedComment) {
      return NextResponse.json(
        { error: "Comment contains invalid or disallowed content" },
        { status: 400 },
      );
    }

    const payload = await getPayloadClient();

    // const existing = await payload.find({
    //   collection: "feedback",
    //   where: {
    //     userId: { equals: userId },
    //     lesson: { equals: lessonId },
    //   },
    //   limit: 1,
    // });

    // if (existing.totalDocs > 0) {
    //   return NextResponse.json(
    //     { error: "Feedback already submitted" },
    //     { status: 409 },
    //   );
    // }

    await payload.create({
      collection: "feedback",
      data: {
        lesson: lessonId,
        userName,
        userEmail,
        userId,
        reaction,
        comment: sanitizedComment,
      },
      overrideAccess: true,
    });

    return NextResponse.json(
      { success: true },
      { status: 201, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}
