import { serverEnv } from "@env/server";
import Mux from "@mux/mux-node";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { clientEnv } from "@/env/client";
import { auth } from "@/lib/auth/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { rateLimit } from "@/lib/rate-limit";

const mux = new Mux({
  tokenId: serverEnv.MUX_TOKEN_ID,
  tokenSecret: serverEnv.MUX_TOKEN_SECRET,
  jwtSigningKey: serverEnv.MUX_JWT_KEY_ID,
  jwtPrivateKey: serverEnv.MUX_JWT_KEY,
});

const limiter = rateLimit({ max: 6, windowMs: 60_000 });

/**
 * generates signed Mux tokens (video + storyboard)
 * after verifying user session and course enrollment.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed, retryAfter } = limiter(ip);
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

    const { playbackId } = await request.json();
    if (!playbackId)
      return NextResponse.json(
        { error: "playbackId required" },
        { status: 400 },
      );

    if (!serverEnv.MUX_JWT_KEY || !serverEnv.MUX_JWT_KEY_ID) {
      return NextResponse.json(
        { error: "Server missing MUX_JWT_KEY or MUX_JWT_KEY_ID" },
        { status: 500 },
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

    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
          eq(enrollment.userId, session.user.id),
          eq(enrollment.courseId, courseId),
          eq(enrollment.status, "completed"),
        ),
      )
      .limit(1);

    if (!rows.length)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const expiration = clientEnv.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION;

    const [videoToken, storyboardToken] = await Promise.all([
      mux.jwt.signPlaybackId(playbackId, {
        expiration,
        type: "video",
      }),
      mux.jwt.signPlaybackId(playbackId, {
        expiration,
        type: "storyboard",
      }),
    ]);

    return NextResponse.json({
      playback: videoToken,
      storyboard: storyboardToken,
    });
  } catch (err) {
    console.error("/api/mux/token error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
