import { serverEnv } from "@env/server";
import Mux from "@mux/mux-node";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { clientEnv } from "@/env/client";
import { auth } from "@/lib/auth";
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
 * returns a Mux playback token:
 * - free lessons: long-lived token (MUX_PUBLIC_EXPIRATION)
 * - paid lessons: short-lived token after verifying user (MUX_SIGNED_URL_EXPIRATION)
 *
 * TODO: implement public (unsigned) playback for free lessons if possible
 */
export async function POST(request: NextRequest) {
  try {
    // limit per ip
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed, retryAfter } = limiter(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Too many requests, try again later",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(retryAfter ?? 1 / 1000).toString(),
          },
        },
      );
    }

    const body = await request.json();
    const playbackId = body?.playbackId;
    if (!playbackId) {
      return NextResponse.json(
        { error: "playbackId required" },
        { status: 400 },
      );
    }

    // ensure MUX keys exist
    if (!serverEnv.MUX_JWT_KEY || !serverEnv.MUX_JWT_KEY_ID) {
      return NextResponse.json(
        {
          error:
            "Server missing MUX_JWT_KEY or MUX_JWT_KEY_ID. Please add signing keys.",
        },
        { status: 500 },
      );
    }

    const payload = await getPayloadClient();

    // find the mux-video that contains this playbackId
    const found = await payload.find({
      collection: "mux-video",
      where: { "playbackOptions.playbackId": { equals: playbackId } },
      limit: 1,
    });

    const video = found.docs?.[0];
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // find lesson that references this video
    const lessons = await payload.find({
      collection: "lessons",
      where: { video: { equals: video.id } },
      limit: 1,
      select: { free: true, course: true },
    });

    const lesson = lessons.docs?.[0];
    if (!lesson) {
      return NextResponse.json(
        { error: "No lesson references this video" },
        { status: 404 },
      );
    }

    let tokenExpiration = "";
    let allow = false;

    // free lessons: allow anonymous token issuance
    if (lesson.free) {
      tokenExpiration = clientEnv.NEXT_PUBLIC_MUX_PUBLIC_EXPIRATION;
      allow = true;
    } else {
      // paid lessons: require session + enrollment
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const courseId =
        typeof lesson.course === "string" ? lesson.course : lesson.course?.id;
      if (!courseId) {
        return NextResponse.json(
          { error: "Lesson course missing" },
          { status: 400 },
        );
      }

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

      allow = rows.length > 0;
      if (!allow)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      tokenExpiration = clientEnv.NEXT_PUBLIC_MUX_SIGNED_URL_EXPIRATION;
    }

    // sign token for both free and paid lessons
    const token = await mux.jwt.signPlaybackId(playbackId, {
      expiration: tokenExpiration,
      type: "video",
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("/api/mux/token error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
