import { serverEnv } from "@env/server";
import Mux from "@mux/mux-node";
import { Ratelimit } from "@upstash/ratelimit";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { clientEnv } from "@/env/client";
import { auth } from "@/lib/auth/auth";
import { VIDEO_LIMITS } from "@/lib/constants/limits";
import { getPayloadClient } from "@/lib/payload-client";
import { redis } from "@/lib/redis";

const mux = new Mux({
  tokenId: serverEnv.MUX_TOKEN_ID,
  tokenSecret: serverEnv.MUX_TOKEN_SECRET,
  jwtSigningKey: serverEnv.MUX_JWT_KEY_ID,
  jwtPrivateKey: serverEnv.MUX_JWT_KEY,
});

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(6, "180 s"),
  analytics: true,
  prefix: "mux_token_ratelimit",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playbackId } = await request.json();

    if (
      !playbackId ||
      typeof playbackId !== "string" ||
      playbackId.length > VIDEO_LIMITS.playbackId
    ) {
      return NextResponse.json(
        { error: "Invalid playbackId" },
        { status: 400 },
      );
    }

    if (!serverEnv.MUX_JWT_KEY || !serverEnv.MUX_JWT_KEY_ID) {
      return NextResponse.json(
        { error: "Server missing MUX_JWT_KEY or MUX_JWT_KEY_ID" },
        { status: 500 },
      );
    }

    const userId = session.user.id;

    const { success, limit, remaining, reset } = await limiter.limit(userId);
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

    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: "mux-video",
      where: { "playbackOptions.playbackId": { equals: playbackId } },
      limit: 1,
    });

    const video = found.docs?.[0];
    if (!video)
      return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const lessons = await payload.find({
      collection: "lessons",
      where: { video: { equals: video.id } },
      limit: 1,
      select: { course: true },
    });

    const lesson = lessons.docs?.[0];
    if (!lesson)
      return NextResponse.json(
        { error: "No lesson references this video" },
        { status: 404 },
      );

    const courseId =
      typeof lesson.course === "string" ? lesson.course : lesson.course?.id;
    if (!courseId)
      return NextResponse.json(
        { error: "Lesson course missing" },
        { status: 400 },
      );

    const rows = await db
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

    if (!rows.length)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const expiration = clientEnv.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION;

    const [videoToken, storyboardToken] = await Promise.all([
      mux.jwt.signPlaybackId(playbackId, { expiration, type: "video" }),
      mux.jwt.signPlaybackId(playbackId, { expiration, type: "storyboard" }),
    ]);

    return NextResponse.json(
      { playback: videoToken, storyboard: storyboardToken },
      { headers: rateLimitHeaders },
    );
  } catch (err) {
    console.error("/api/mux/token error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
