import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FEEDBACK_LIMITS } from "@/lib/constants/limits";
import { getPayloadClient } from "@/lib/payload-client";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ windowMs: 180_000, max: 2 });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, userName, userId, reaction, comment, userEmail } = body;

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userId !== session.user.id || userEmail !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // limit per user
    const { allowed, retryAfter } = limiter(session.user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests, try again later" },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(retryAfter ?? 1 / 1000).toString(),
          },
        },
      );
    }

    if (!lessonId || !userName || !userId || !reaction || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (comment.length > FEEDBACK_LIMITS.comment) {
      return NextResponse.json(
        {
          error: `Comment is too long (${comment.length}/${FEEDBACK_LIMITS.comment})`,
        },
        { status: 400 },
      );
    }

    if (reaction < 1 || reaction > 4) {
      return NextResponse.json(
        { error: "Reaction must be between 1 and 4" },
        { status: 400 },
      );
    }

    const payload = await getPayloadClient();

    // const existing = await payload.find({
    //   collection: "feedback",
    //   where: {
    //     userId: { equals: session.user.id },
    //     lesson: { equals: lessonId },
    //   },
    // });
    // if (existing.totalDocs > 0) {
    //   return NextResponse.json(
    //     { error: "Feedback already submitted" },
    //     { status: 400 },
    //   );
    // }

    const feedback = await payload.create({
      collection: "feedback",
      data: {
        lesson: lessonId,
        userName,
        userEmail,
        userId,
        reaction,
        comment: comment || "",
      },
      overrideAccess: true,
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}
