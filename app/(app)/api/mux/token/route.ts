import { serverEnv } from "@env/server";
import { Ratelimit } from "@upstash/ratelimit";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { publishedStatusWhere } from "@/cms/access/contentAccess";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { clientEnv } from "@/env/client";
import { auth } from "@/lib/auth/auth";
import { LIMITS } from "@/lib/constants/limits";
import { mux } from "@/lib/mux";
import { getPayloadClient } from "@/lib/payload-client";
import { redis } from "@/lib/redis";

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(6, "180 s"),
  analytics: true,
  prefix: "mux_token_ratelimit",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.user.emailVerified) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 },
      );
    }
    const { playbackId } = await request.json();

    if (
      !playbackId ||
      typeof playbackId !== "string" ||
      playbackId.length > LIMITS.video.playbackIdMaxLength
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
      overrideAccess: true,
      where: { "playbackOptions.playbackId": { equals: playbackId } },
      limit: 1,
    });

    const video = found.docs?.[0];
    if (!video)
      return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const lessons = await payload.find({
      collection: "lessons",
      overrideAccess: true,
      where: {
        and: [publishedStatusWhere, { video: { equals: video.id } }],
      },
      limit: 1,
      select: { course: true, videoChapters: true },
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

    const chapterStartTimes = (lesson.videoChapters || [])
      .sort((a, b) => a.startTime - b.startTime)
      .map((chapter) => chapter.startTime);

    const chapterTokens = await Promise.all(
      chapterStartTimes.map(async (startTime) => {
        const token = await mux.jwt.signPlaybackId(playbackId, {
          expiration,
          type: "thumbnail",
          params: { time: startTime.toString() },
        });
        return { startTime, token };
      }),
    );

    const [videoToken, thumbnailToken, storyboardToken] = await Promise.all([
      mux.jwt.signPlaybackId(playbackId, { expiration, type: "video" }),
      mux.jwt.signPlaybackId(playbackId, {
        expiration,
        type: "thumbnail",
      }),
      mux.jwt.signPlaybackId(playbackId, { expiration, type: "storyboard" }),
    ]);

    return NextResponse.json(
      {
        playback: videoToken,
        thumbnail: thumbnailToken,
        storyboard: storyboardToken,
        chapterThumbnails: chapterTokens,
      },
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
